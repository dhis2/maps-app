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
    const alerts = []

    const orgUnitParams = orgUnits.map((item) => item.id)
    let associatedGeometries

    const name = i18n.t('Facilities')

    const ouParam = `ou:${orgUnitParams.join(';')}`

    const data = await engine.query(
        GEOFEATURES_QUERY,
        {
            variables: {
                ou: ouParam,
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
                    message: i18n.t('Error: {{message}}', {
                        message: error.message || i18n.t('an error occurred'),
                        nsSeparator: ';',
                    }),
                })
            },
        }
    )

    const features = data?.geoFeatures
        ? toGeoJson(getPointItems(data.geoFeatures))
        : null

    // Load organisationUnitGroups if not passed
    let orgUnitGroups
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        orgUnitGroups = await engine.query(
            ORG_UNITS_GROUP_SET_QUERY,
            {
                variables: {
                    id: groupSet?.id,
                },
            },
            { onError: (error) => console.log('Error loading ouGroups', error) }
        )
    }

    if (orgUnitGroups) {
        const { groupSets } = orgUnitGroups
        groupSet.organisationUnitGroups = parseGroupSet({
            organisationUnitGroups: groupSets.organisationUnitGroups,
        })
    }

    const { styledFeatures, legend } = getStyledOrgUnits({
        features,
        groupSet,
        config,
        baseUrl,
    })

    legend.title = name

    if (coordinateField) {
        const newdata = await engine.query(
            GEOFEATURES_QUERY,
            {
                variables: {
                    ou: ouParam,
                    keyAnalysisDisplayProperty,
                    includeGroupSets,
                    coordinateField: coordinateField.id,
                    userId,
                },
            },
            {
                onError: (error) => {
                    alerts.push({
                        critical: true,
                        code: ERROR_CRITICAL,
                        message: i18n.t('Error: {{message}}', {
                            message:
                                error.message || i18n.t('an error occurred'),
                            nsSeparator: ';',
                        }),
                    })
                },
            }
        )

        associatedGeometries = newdata?.geoFeatures
            ? toGeoJson(getPolygonItems(newdata.geoFeatures))
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

    legend.title = name

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
    }
}

export default facilityLoader
