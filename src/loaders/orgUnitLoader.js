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

    const orgUnitIds = orgUnits.map((item) => item.id)
    let associatedGeometries
    const name = i18n.t('Organisation units')

    const data = await engine.query(
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

    const mainFeatures = data?.geoFeatures ? toGeoJson(data.geoFeatures) : null

    const orgUnitLevels = await apiFetchOrganisationUnitLevels(engine)

    // Load organisationUnitGroups if not passed
    let orgUnitGroups
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        orgUnitGroups = await engine.query(ORG_UNITS_GROUP_SET_QUERY, {
            variables: {
                id: groupSet?.id,
            },
        })
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
            ? toGeoJson(rawData.geoFeatures)
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
                [item.level]: item.displayName, // orgUnitLevels do not have shortNames
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
