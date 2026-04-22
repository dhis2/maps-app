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
    ORG_UNITS_GROUP_SET_QUERY,
    getPointItems,
    getPolygonItems,
    getStyledOrgUnits,
    getCoordinateField,
    parseGroupSet,
    getOrgUnitsWithoutCoordsCount,
    addGroupCountsToLegend,
} from '../util/orgUnits.js'
import { GEOFEATURES_QUERY } from '../util/requests.js'

const fetchAndParseGroupSet = async (engine, groupSet) => {
    try {
        const orgUnitGroups = await engine.query(ORG_UNITS_GROUP_SET_QUERY, {
            variables: { id: groupSet?.id },
        })
        const { groupSets } = orgUnitGroups
        groupSet.organisationUnitGroups = parseGroupSet({
            organisationUnitGroups: groupSets.organisationUnitGroups,
        })
        groupSet.name = groupSets.name
        return null
    } catch {
        return i18n.t('GroupSet used for styling was not found')
    }
}

const fetchAssociatedGeometries = async (
    engine,
    {
        orgUnitIds,
        keyAnalysisDisplayProperty,
        includeGroupSets,
        coordinateField,
        userId,
    }
) => {
    const rawData = await engine.query(GEOFEATURES_QUERY, {
        variables: {
            orgUnitIds,
            keyAnalysisDisplayProperty,
            includeGroupSets,
            coordinateField: coordinateField.id,
            userId,
        },
    })
    return rawData?.geoFeatures
        ? toGeoJson(getPolygonItems(rawData.geoFeatures))
        : null
}

const facilityLoader = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    userId,
    baseUrl,
}) => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config
    const { countOrgUnitsWithoutCoordinates } = parseJsonConfig(config.config)
    if (countOrgUnitsWithoutCoordinates) {
        config.countOrgUnitsWithoutCoordinates = true
    }
    delete config.config

    const orgUnits = getOrgUnitsFromRows(rows)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)

    let loadError
    const alerts = []

    const orgUnitIds = orgUnits.map((item) => item.id)
    let associatedGeometries

    const name = i18n.t('Facilities')

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

    const features =
        data?.geoFeatures && toGeoJson(getPointItems(data.geoFeatures))

    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        loadError = await fetchAndParseGroupSet(engine, groupSet)
    }

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

    if (config.countOrgUnitsWithoutCoordinates) {
        const { count, missingOrgUnits } = await getOrgUnitsWithoutCoordsCount({
            engine,
            orgUnitIds,
            userId,
            features: features || [],
        })
        if (count > 0) {
            legend.orgUnitsWithoutCoordinatesCount = count
            config.dataWithoutCoords = missingOrgUnits
        }
    }

    if (coordinateField) {
        associatedGeometries = await fetchAssociatedGeometries(engine, {
            orgUnitIds,
            keyAnalysisDisplayProperty,
            includeGroupSets,
            coordinateField,
            userId,
        })

        if (!associatedGeometries.length) {
            alerts.push({
                code: WARNING_NO_GEOMETRY_COORD,
                message: coordinateField.name,
            })
        }

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
