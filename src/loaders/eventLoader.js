import { ouIdHelper } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    CUSTOM_ALERT,
    WARNING_NO_DATA,
    WARNING_ALL_EVENTS_OUTSIDE_OU,
    WARNING_OU_BOUNDARIES_FETCH_FAILED,
} from '../constants/alerts.js'
import { getEventStatuses } from '../constants/eventStatuses.js'
import {
    EVENT_CLIENT_PAGE_SIZE,
    EVENT_SERVER_CLUSTER_COUNT,
    EVENT_COLOR,
    EVENT_RADIUS,
} from '../constants/layers.js'
import { numberValueTypes } from '../constants/valueTypes.js'
import {
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodsFromFilters,
    getPeriodNameFromId,
    getOrgUnitsFromRows,
} from '../util/analytics.js'
import { cssColor, getContrastColor } from '../util/colors.js'
import { parseJsonConfig } from '../util/config.js'
import { loadEventCoordinateFieldName } from '../util/coordinatesName.js'
import { getAnalyticsRequest, loadData } from '../util/event.js'
import {
    getBounds,
    getContainingOrgUnit,
    GEO_TYPE_POINT,
} from '../util/geojson.js'
import { formatWithSeparator, parseWithSeparator } from '../util/numbers.js'
import {
    fetchAssociatedGeometries,
    fetchOrgUnitPaths,
    getPolygonItems,
    getUserOrgUnitIdsByKeyword,
} from '../util/orgUnits.js'
import { OPTION_SET_QUERY } from '../util/requests.js'
import { styleByDataItem } from '../util/styleByDataItem.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'
import { isValidUid } from '../util/uid.js'

// OU dimension value is always an ID; property key depends on outputIdScheme
const getEventOuId = (feature) =>
    feature.properties?.ou ?? feature.properties?.['Organisation unit']

// Expands USER_ORGUNIT/_CHILDREN/_GRANDCHILDREN into ids; [id] if literal.
const expandOrgUnitKeyword = (id, userOrgUnitIdsByKeyword) => {
    if (id in userOrgUnitIdsByKeyword) {
        return userOrgUnitIdsByKeyword[id]
    }
    if (ouIdHelper.hasLevelPrefix(id) || ouIdHelper.hasGroupPrefix(id)) {
        // LEVEL/OU_GROUP unsupported today; resolve here if that changes.
        return []
    }
    return [id]
}

// Server clustering if more than 2000 events, and the backend supports it
export const shouldUseServerCluster = ({
    count,
    countFeaturesWithoutCoordinates,
    countEventsOutsideOrgUnits,
    spatialSupport,
}) =>
    !!spatialSupport &&
    !countFeaturesWithoutCoordinates &&
    !countEventsOutsideOrgUnits &&
    count > EVENT_SERVER_CLUSTER_COUNT

// Alert constants
// -----

const accessDeniedAlert = {
    warning: true,
    code: CUSTOM_ALERT,
    message: i18n.t("You don't have access to this layer data"),
}
const filterErrorAlert = {
    warning: true,
    code: CUSTOM_ALERT,
    message: i18n.t('The event filter is not supported'),
}
const unknownErrorAlert = {
    critical: true,
    code: CUSTOM_ALERT,
    message: i18n.t('An unknown error occurred while reading layer data'),
}

// Returns a promise
const eventLoader = async ({
    config: layerConfig,
    engine,
    keyAnalysisDisplayProperty,
    keyAnalysisDigitGroupSeparator,
    userOrgUnitIdsByKeyword = getUserOrgUnitIdsByKeyword(),
    analyticsEngine,
    periodTypeData,
    loadExtended,
    spatialSupport,
}) => {
    const config = {
        ...layerConfig,
        keyAnalysisDigitGroupSeparator,
    }
    const displayNameProp =
        keyAnalysisDisplayProperty === 'name'
            ? 'displayName'
            : 'displayShortName'

    try {
        await loadEventLayer({
            config,
            engine,
            displayNameProp,
            keyAnalysisDisplayProperty,
            userOrgUnitIdsByKeyword,
            analyticsEngine,
            periodTypeData,
            loadExtended,
            spatialSupport,
        })
    } catch (e) {
        if (
            e.details?.httpStatusCode === 403 ||
            e.details?.httpStatusCode === 409
        ) {
            config.alerts = [
                e.details?.message.includes('filter is invalid')
                    ? filterErrorAlert
                    : accessDeniedAlert,
            ]
        } else {
            config.alerts = [unknownErrorAlert]
        }
    }

    config.isLoaded = true
    config.isLoading = false
    config.isExpanded = true

    return config
}

const loadEventLayer = async ({
    config,
    engine,
    displayNameProp,
    keyAnalysisDisplayProperty,
    userOrgUnitIdsByKeyword,
    analyticsEngine,
    periodTypeData,
    loadExtended,
    spatialSupport,
}) => {
    // Config normalization
    // -----

    const {
        countFeaturesWithoutCoordinates,
        countEventsOutsideOrgUnits,
        legendDecimalPlaces,
        legendIsolated,
        unclassifiedLegend: unclassifiedLegendFromConfig,
        noDataLegend: noDataLegendFromConfig,
        labelDataItem,
        dataTableColumnConfig,
    } = parseJsonConfig(config.config)
    if (countFeaturesWithoutCoordinates) {
        config.countFeaturesWithoutCoordinates = true
    }
    if (countEventsOutsideOrgUnits) {
        config.countEventsOutsideOrgUnits = true
    }
    if (labelDataItem) {
        if (labelDataItem.optionSet?.id) {
            const { optionSet } = await engine.query(OPTION_SET_QUERY, {
                variables: { id: labelDataItem.optionSet.id },
            })
            config.labelDataItem = {
                ...labelDataItem,
                options: optionSet.options.reduce((obj, { code, name }) => {
                    obj[code] = name
                    return obj
                }, {}),
            }
        } else {
            config.labelDataItem = labelDataItem
        }
    }
    if (legendDecimalPlaces !== undefined) {
        config.legendDecimalPlaces = legendDecimalPlaces
    }
    if (legendIsolated) {
        config.legendIsolated = legendIsolated
    }
    if (unclassifiedLegendFromConfig) {
        config.unclassifiedLegend = unclassifiedLegendFromConfig
    }
    if (noDataLegendFromConfig) {
        config.noDataLegend = noDataLegendFromConfig
    }
    if (dataTableColumnConfig) {
        config.dataTableColumnConfig = dataTableColumnConfig
    }
    if (config.noDataColor) {
        config.noDataLegend = {
            ...noDataLegendFromConfig,
            color: config.noDataColor,
        }
    }
    delete config.noDataColor
    delete config.config

    // Analytics request setup
    // -----

    const {
        columns,
        endDate,
        eventStatus,
        eventClustering,
        eventPointColor,
        eventPointRadius,
        filters,
        keyAnalysisDigitGroupSeparator,
        program,
        programStage,
        eventCoordinateField,
        startDate,
        styleDataItem,
        areaRadius,
    } = config

    // Mutates the pe items in filters so period display names are shown
    const periods = getPeriodsFromFilters(filters).map((pe) => {
        pe.name =
            periodTypeData?.enabledPeriodTypesData?.metaData?.[pe.id]?.name ??
            getPeriodNameFromId(pe.id)
        return pe
    })

    const dataFilters = getFiltersFromColumns(columns)

    config.isExtended = loadExtended

    const analyticsRequest = await getAnalyticsRequest(config, {
        analyticsEngine,
        nameProperty: displayNameProp,
        engine,
    })
    const alerts = []

    // Legend skeleton
    // -----

    config.name = programStage.name

    config.legend = {
        title: config.name,
        period:
            periods.length > 0
                ? periods.map((pe) => pe.name || pe.id).join(', ')
                : formatStartEndDate(
                      getDateArray(startDate),
                      getDateArray(endDate)
                  ),
        items: [],
        ...(config.legendDecimalPlaces !== undefined && {
            decimalPlaces: config.legendDecimalPlaces,
        }),
    }

    // Server-side clustering decision
    // -----

    // Delete serverCluster option if previously set
    delete config.serverCluster

    // Check if events should be clustered on the server or the client
    // Style by data item is only supported in the client (donuts)
    let serverCount
    if (eventClustering && !styleDataItem) {
        const response = await analyticsEngine.events.getCount(analyticsRequest)
        config.bounds = getBounds(response.extent)
        config.serverCluster = shouldUseServerCluster({
            count: response.count,
            countFeaturesWithoutCoordinates:
                config.countFeaturesWithoutCoordinates,
            countEventsOutsideOrgUnits: config.countEventsOutsideOrgUnits,
            spatialSupport,
        })
        serverCount = response.count
    }

    // Load event data
    // -----

    if (!config.serverCluster) {
        config.outputIdScheme = 'ID' // Required for StyleByDataItem to work
        const { data, response, dataWithoutCoords } = await loadData({
            request: analyticsRequest,
            config,
            analyticsEngine,
        })
        const { total } = response.metaData.pager

        config.data = data
        if (config.countFeaturesWithoutCoordinates) {
            config.dataWithoutCoords = dataWithoutCoords
            config.legend.eventsWithoutCoordinatesCount =
                dataWithoutCoords.length
        }

        if (config.countEventsOutsideOrgUnits && config.data?.length) {
            // TODO: parallelize this with loadData above
            await excludeEventsOutsideOrgUnits({
                config,
                engine,
                dataWithoutCoords,
                keyAnalysisDisplayProperty,
                userOrgUnitIdsByKeyword,
                alerts,
            })
        }

        if (styleDataItem) {
            await styleByDataItem(config, engine)
        }

        // Result alert
        // -----

        if (Array.isArray(config.data) && config.data.length) {
            if (total > EVENT_CLIENT_PAGE_SIZE) {
                alerts.push({
                    warning: true,
                    code: CUSTOM_ALERT,
                    message: `${config.name}: ${i18n.t(
                        'Displaying first {{pageSize}} events out of {{total}}',
                        {
                            pageSize: formatWithSeparator(
                                EVENT_CLIENT_PAGE_SIZE,
                                keyAnalysisDigitGroupSeparator
                            ),
                            total: formatWithSeparator(
                                total,
                                keyAnalysisDigitGroupSeparator
                            ),
                        }
                    )}`,
                })
            }
        } else {
            alerts.push({
                code:
                    config.countEventsOutsideOrgUnits &&
                    config.legend.eventsOutsideOrgUnitsCount
                        ? WARNING_ALL_EVENTS_OUTSIDE_OU
                        : WARNING_NO_DATA,
                message: config.name,
            })
        }

        // Numeric property coercion
        // -----

        config.headers = response.headers

        const numericDataItemHeaders = config.headers.filter(
            (header) =>
                isValidUid(header.name) &&
                numberValueTypes.includes(header.valueType) &&
                !header.optionSet
        )

        if (numericDataItemHeaders.length) {
            config.data = config.data.map((d) => {
                const newD = { ...d }

                numericDataItemHeaders.forEach((header) => {
                    newD.properties[header.name] = parseWithSeparator(
                        d.properties[header.name]
                    )
                })

                return newD
            })
        }
    }

    // Legend filters
    // -----

    if (dataFilters) {
        const { names, response } = await loadData({
            request: analyticsRequest,
            config,
            analyticsEngine,
            pageSize: 0,
        })
        config.legend.filters = getFiltersAsText(dataFilters, {
            ...names,
            ...(await getFilterOptionNames(
                dataFilters,
                response.headers,
                engine
            )),
        })
    }

    // Coordinate field
    // -----

    const eventCoordinateFieldName = await loadEventCoordinateFieldName({
        program,
        programStage,
        eventCoordinateField,
        engine,
        displayNameProp,
    })
    if (eventCoordinateFieldName) {
        config.legend.coordinateFields = [eventCoordinateFieldName]
    }

    // Legend items & explanation
    // -----

    if (!styleDataItem) {
        const color = cssColor(eventPointColor) || EVENT_COLOR
        const strokeColor = getContrastColor(color)

        config.legend.items = [
            {
                name: i18n.t('Event'),
                color,
                strokeColor,
                radius: eventPointRadius || EVENT_RADIUS,
                count:
                    serverCount ||
                    (Array.isArray(config?.data) ? config.data.length : 0),
            },
        ]
    }

    const explanation = []

    if (eventStatus) {
        explanation.push(
            `${i18n.t('Event status')}: ${
                getEventStatuses().find((s) => s.id === eventStatus).name
            }`
        )
    }

    if (areaRadius) {
        explanation.push(`${i18n.t('Buffer')}: ${areaRadius} ${'m'}`)
    }

    if (explanation.length) {
        config.legend.explanation = explanation
    }

    config.alerts = alerts.length ? alerts : undefined
}

// Classifies each event as inside/outside the selected org-unit boundaries,
// tagging inside events with the name of their containing org unit.
const classifyEventsByOrgUnit = ({
    data,
    orgUnitGeometries,
    facilityToAncestorGeometry,
    ouIdByGeometry,
    geoFeatureNameByOuId,
    ouNames,
}) => {
    const inside = []
    const outside = []
    for (const feature of data) {
        if (feature.geometry?.type !== GEO_TYPE_POINT) {
            inside.push(feature)
            continue
        }

        const facilityOuId = getEventOuId(feature)
        const ancestorGeometry = facilityToAncestorGeometry.get(facilityOuId)
        // Check the facility's own ancestor org unit first, since it's
        // usually the match; only fall back to the full search if not.
        const containingGeometry =
            (ancestorGeometry &&
                getContainingOrgUnit(feature.geometry.coordinates, [
                    ancestorGeometry,
                ])) ||
            getContainingOrgUnit(
                feature.geometry.coordinates,
                orgUnitGeometries
            )

        if (!containingGeometry) {
            outside.push(feature)
            continue
        }

        const ouId = ouIdByGeometry.get(containingGeometry)
        feature.properties.ouBoundary =
            geoFeatureNameByOuId.get(ouId) ?? ouNames.get(ouId) ?? ouId
        inside.push(feature)
    }
    return { inside, outside }
}

// Tags each remaining event with its containing org unit, and records
// boundary coverage on the legend since some selected org units may lack one.
export const excludeEventsOutsideOrgUnits = async ({
    config,
    engine,
    dataWithoutCoords,
    keyAnalysisDisplayProperty,
    userOrgUnitIdsByKeyword = getUserOrgUnitIdsByKeyword(),
    alerts = [],
}) => {
    // Fetch org unit boundaries
    // -----

    const orgUnits = getOrgUnitsFromRows(config.rows)
    const orgUnitIds = orgUnits.map((ou) => ou.id)
    const ouNames = new Map(orgUnits.map((ou) => [ou.id, ou.name]))

    // USER_ORGUNIT keywords expand to multiple ids, so count the expanded set.
    const literalOrgUnitIds = [
        ...new Set(
            orgUnitIds.flatMap((id) =>
                expandOrgUnitKeyword(id, userOrgUnitIdsByKeyword)
            )
        ),
    ]

    // Collect unique facility OU IDs, used below (once boundaries are known)
    // to resolve each facility's nearest selected-org-unit ancestor.
    const facilityOuIds = [
        ...new Set(
            config.data
                .filter((feature) => feature.geometry?.type === GEO_TYPE_POINT)
                .map(getEventOuId)
                .filter(Boolean)
        ),
    ]

    // Coverage count is based on geoJsonFeatures, which also excludes
    // degenerate/empty-coordinate boundaries.
    let geoJsonFeatures
    try {
        const result = await fetchAssociatedGeometries(
            engine,
            { orgUnitIds, keyAnalysisDisplayProperty, coordinateField: {} },
            getPolygonItems
        )
        if (result === null) {
            throw new Error('geoFeatures response missing geoFeatures')
        }
        geoJsonFeatures = result
    } catch {
        // Treat a failed fetch the same as no org units having boundaries.
        geoJsonFeatures = []
        alerts.push({
            warning: true,
            code: WARNING_OU_BOUNDARIES_FETCH_FAILED,
            message: config.name,
        })
    }
    const polygonOrgUnitIds = new Set(geoJsonFeatures.map((f) => f.id))
    const orgUnitsWithoutBoundary = literalOrgUnitIds.filter(
        (id) => !polygonOrgUnitIds.has(id)
    )
    if (orgUnitsWithoutBoundary.length) {
        config.legend.orgUnitsWithoutBoundaryCount =
            orgUnitsWithoutBoundary.length
        config.legend.orgUnitsTotalCount = literalOrgUnitIds.length
    }

    // Resolve each facility's nearest selected-org-unit ancestor
    // -----

    // Sorted deepest level first, so a OU wins over its parent.
    // Same-level org units are just ordered by selection.
    const orgUnitGeometries = [...geoJsonFeatures]
        .sort((a, b) => b.properties.level - a.properties.level)
        .map((f) => f.geometry)
    const geometryByOuId = new Map(
        geoJsonFeatures.map((f) => [f.id, f.geometry])
    )
    const ouIdByGeometry = new Map(
        geoJsonFeatures.map((f) => [f.geometry, f.id])
    )
    const geoFeatureNameByOuId = new Map(
        geoJsonFeatures.map((f) => [f.id, f.properties.name])
    )

    // Map each facility to its most immediate selected-OU ancestor via its
    // path. Skipped for a single polygon OU, where ordering can't matter.
    const ouPaths =
        polygonOrgUnitIds.size > 1
            ? await fetchOrgUnitPaths(engine, facilityOuIds)
            : []
    const facilityToAncestorGeometry = new Map()
    for (const { id, path } of ouPaths) {
        const pathIds = path.split('/').filter(Boolean)
        // Search from end to find the most immediate ancestor
        const ancestorOuId = [...pathIds]
            .reverse()
            .find((ouId) => polygonOrgUnitIds.has(ouId))
        if (ancestorOuId) {
            facilityToAncestorGeometry.set(id, geometryByOuId.get(ancestorOuId))
        }
    }

    if (!orgUnitGeometries.length) {
        return
    }

    // Classify events by containment
    // -----

    // TODO: synchronous over all events — consider chunking/yielding for very large layers.
    const { inside, outside } = classifyEventsByOrgUnit({
        data: config.data,
        orgUnitGeometries,
        facilityToAncestorGeometry,
        ouIdByGeometry,
        geoFeatureNameByOuId,
        ouNames,
    })
    config.data = inside
    config.legend.eventsOutsideOrgUnitsCount = outside.length
    config.dataWithoutCoords = [
        ...(config.countFeaturesWithoutCoordinates ? dataWithoutCoords : []),
        ...outside,
    ]
}

// If the layer included filters using option sets, this function return an object
// mapping option codes to named used to translate codes in the legend
const getFilterOptionNames = async (filters, headers, engine) => {
    if (!filters) {
        return null
    }

    // Returns array of option set ids used for filtering
    const optionSets = filters
        .map((filter) =>
            headers.find((header) => header.name === filter.dimension)
        )
        .filter((header) => header.optionSet)
        .map((header) => header.optionSet)

    if (!optionSets.length) {
        return
    }

    const allOptionSets = await Promise.all(
        optionSets.map((id) =>
            engine.query(OPTION_SET_QUERY, {
                variables: { id },
            })
        )
    )

    // Returns one object with all option codes mapped to names
    return allOptionSets
        .map(({ optionSet }) =>
            optionSet.options.reduce((obj, { code, name }) => {
                obj[code] = name
                return obj
            }, {})
        )
        .reduce(
            (obj, set) => ({
                ...obj,
                ...set,
            }),
            {}
        )
}

export default eventLoader
