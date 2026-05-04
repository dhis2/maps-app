import i18n from '@dhis2/d2-i18n'
import {
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
    CUSTOM_ALERT,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { parseJsonConfig } from '../util/config.js'
import { toGeoJson } from '../util/map.js'
import {
    getPointItems,
    getPolygonItems,
    getStyledOrgUnits,
    getCoordinateField,
    getOrgUnitsWithoutCoordsCount,
    addGroupCountsToLegend,
    fetchAndParseGroupSet,
    fetchAssociatedGeometries,
} from '../util/orgUnits.js'
import { GEOFEATURES_QUERY } from '../util/requests.js'

const facilityLoader = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    userId,
    baseUrl,
}) => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config
    const includeGroupSets = !!groupSet
    const orgUnits = getOrgUnitsFromRows(rows)
    const orgUnitIds = orgUnits.map((item) => item.id)
    const coordinateField = getCoordinateField(config)

    const name = i18n.t('Facilities')
    let loadError
    const alerts = []

    // Config parsing
    // -----

    const { countFeaturesWithoutCoordinates } = parseJsonConfig(config.config)
    if (countFeaturesWithoutCoordinates) {
        config.countFeaturesWithoutCoordinates = true
    }
    delete config.config

    // Data loading
    // -----

    let data = {}
    try {
        // Fetch geofeatures data
        data = await engine.query(
            GEOFEATURES_QUERY,
            {
                variables: {
                    orgUnitIds,
                    keyAnalysisDisplayProperty,
                    includeGroupSets,
                    userId,
                },
            },
            {
                onError: (error) => {
                    alerts.push({
                        critical: true,
                        code: ERROR_CRITICAL,
                        message: error.message || i18n.t('an error occurred'),
                    })
                },
            }
        )
    } catch (error) {
        alerts.push({
            critical: true,
            code: ERROR_CRITICAL,
            message: error.message || i18n.t('an error occurred'),
        })
    }

    const features = data?.geoFeatures
        ? toGeoJson(getPointItems(data.geoFeatures))
        : []

    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        const parsedGroupSet = await fetchAndParseGroupSet(engine, groupSet)
        if (parsedGroupSet) {
            groupSet.organisationUnitGroups =
                parsedGroupSet.organisationUnitGroups
            groupSet.name = parsedGroupSet.name
        } else {
            loadError = i18n.t('GroupSet used for styling was not found')
        }
    }

    let associatedGeometries
    if (coordinateField) {
        associatedGeometries = await fetchAssociatedGeometries(
            engine,
            {
                orgUnitIds,
                keyAnalysisDisplayProperty,
                includeGroupSets,
                coordinateField,
                userId,
            },
            getPolygonItems
        )

        if (!associatedGeometries?.length) {
            alerts.push({
                code: WARNING_NO_GEOMETRY_COORD,
                message: coordinateField.name,
            })
        }
    }

    // Styling and Legend
    // -----

    const { styledFeatures, legend } = getStyledOrgUnits({
        features,
        groupSet,
        config,
        baseUrl,
    })

    legend.title = name

    if (groupSet?.id) {
        addGroupCountsToLegend(legend.items, styledFeatures, groupSet)
    } else if (legend.items[0]) {
        legend.items[0].count = styledFeatures.length
    }

    if (config.countFeaturesWithoutCoordinates) {
        const result = await getOrgUnitsWithoutCoordsCount({
            engine,
            orgUnitIds,
            userId,
            features,
        })
        if (result.error) {
            alerts.push({
                warning: true,
                code: CUSTOM_ALERT,
                message: i18n.t(
                    'Could not count org units without coordinates'
                ),
            })
        } else {
            legend.orgUnitsWithoutCoordinatesCount = result.count
            if (result.count > 0) {
                config.dataWithoutCoords = result.missingOrgUnits
            }
        }
    }

    if (coordinateField) {
        legend.items.push({
            name: coordinateField.name,
            type: 'polygon',
            strokeColor: '#333',
            fillColor: 'rgba(149, 200, 251, 0.5)',
            weight: 0.5,
        })
    }

    if (areaRadius) {
        legend.explanation = [`${areaRadius} ${'m'} ${'buffer'}`]
    }

    if (!styledFeatures.length) {
        alerts.push({
            warning: true,
            code: CUSTOM_ALERT,
            message: i18n.t('No coordinates found for selected facilities'),
        })
    }

    return {
        ...config,
        data: styledFeatures,
        associatedGeometries,
        name,
        legend,
        alerts,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: config.isVisible ?? true,
        loadError,
    }
}

export default facilityLoader
