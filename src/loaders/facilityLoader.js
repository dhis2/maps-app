import i18n from '@dhis2/d2-i18n'
import {
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
    CUSTOM_ALERT,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { toGeoJson } from '../util/map.js'
import {
    ORG_UNITS_GROUP_SET_QUERY,
    getPointItems,
    getPolygonItems,
    getStyledOrgUnits,
    getCoordinateField,
    parseGroupSet,
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

    // Load organisationUnitGroups if not passed
    let orgUnitGroups
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        try {
            orgUnitGroups = await engine.query(ORG_UNITS_GROUP_SET_QUERY, {
                variables: {
                    id: groupSet?.id,
                },
            })
        } catch (err) {
            loadError = i18n.t('GroupSet used for styling was not found')
        }
    }

    if (orgUnitGroups) {
        const { groupSets } = orgUnitGroups
        groupSet.organisationUnitGroups = parseGroupSet({
            organisationUnitGroups: groupSets.organisationUnitGroups,
        })
        groupSet.name = groupSets.name
    }

    const { styledFeatures, legend } = getStyledOrgUnits({
        features,
        groupSet,
        config,
        baseUrl,
    })
    legend.title = name

    if (coordinateField) {
        const rawData = await engine.query(GEOFEATURES_QUERY, {
            variables: {
                orgUnitIds,
                keyAnalysisDisplayProperty,
                includeGroupSets,
                coordinateField: coordinateField.id,
                userId,
            },
        })

        associatedGeometries = rawData?.geoFeatures
            ? toGeoJson(getPolygonItems(rawData.geoFeatures))
            : null

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
        isVisible: true,
        loadError,
    }
}

export default facilityLoader
