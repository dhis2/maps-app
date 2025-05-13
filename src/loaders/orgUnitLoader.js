import { apiFetchOrganisationUnitLevels } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { toGeoJson } from '../util/map.js'
import {
    ORG_UNITS_GROUP_SET_QUERY,
    addAssociatedGeometries,
    getStyledOrgUnits,
    getCoordinateField,
    parseGroupSet,
} from '../util/orgUnits.js'
import { GEOFEATURES_QUERY } from '../util/requests.js'

const orgUnitLoader = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    userId,
    baseUrl,
}) => {
    const { rows, organisationUnitGroupSet: groupSet } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)
    const alerts = []

    const orgUnitParams = orgUnits.map((item) => item.id)

    const name = i18n.t('Organisation units')

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

    const mainFeatures = data?.geoFeatures ? toGeoJson(data.geoFeatures) : null

    const orgUnitLevels = await apiFetchOrganisationUnitLevels(engine)

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

    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            code: WARNING_NO_OU_COORD,
            message: i18n.t('Org unit layer'),
        })
    }

    if (orgUnitGroups) {
        const { groupSets } = orgUnitGroups
        groupSet.organisationUnitGroups = parseGroupSet({
            organisationUnitGroups: groupSets.organisationUnitGroups,
        })
    }

    let associatedGeometries
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
            ? toGeoJson(newdata.geoFeatures)
            : null

        if (!associatedGeometries.length) {
            alerts.push({
                code: WARNING_NO_GEOMETRY_COORD,
                message: coordinateField.name,
            })
        }
    }

    const features = addAssociatedGeometries(mainFeatures, associatedGeometries)

    const { styledFeatures, legend } = getStyledOrgUnits({
        features,
        groupSet,
        config,
        baseUrl,
        orgUnitLevels: orgUnitLevels.reduce(
            (obj, item) => ({
                ...obj,
                [item.level]: item.name,
            }),
            {}
        ),
    })

    legend.title = name

    return {
        ...config,
        data: styledFeatures,
        name,
        legend,
        alerts,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
    }
}

export default orgUnitLoader
