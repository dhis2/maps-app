import { apiFetchOrganisationUnitLevels } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
    CUSTOM_ALERT,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { parseJsonConfig } from '../util/config.js'
import { toGeoJson } from '../util/map.js'
import {
    addAssociatedGeometries,
    getStyledOrgUnits,
    getCoordinateField,
    getOrgUnitsWithoutCoordsCount,
    fetchOrgUnitDetails,
    addGroupCountsToLegend,
    addLevelCountsToLegend,
    loadGroupSetData,
    fetchAssociatedGeometries,
} from '../util/orgUnits.js'
import { GEOFEATURES_QUERY } from '../util/requests.js'

const applyMissingCoordsCount = async (
    config,
    { engine, orgUnitIds, userId, features, legend, alerts }
) => {
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
            message: i18n.t('Could not count org units without coordinates'),
        })
        return
    }
    legend.orgUnitsWithoutCoordinatesCount = result.count
    if (result.count > 0) {
        const details = await fetchOrgUnitDetails(
            engine,
            result.missingOrgUnits.map((o) => o.id)
        )
        config.dataWithoutCoords = result.missingOrgUnits.map((ou) => ({
            ...ou,
            properties: {
                ...ou.properties,
                level: details[ou.id]?.level,
                parentName: details[ou.id]?.parentName,
            },
        }))
    }
}

const orgUnitLoader = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    userId,
    baseUrl,
}) => {
    const { rows, organisationUnitGroupSet: groupSet } = config
    const includeGroupSets = !!groupSet
    const orgUnits = getOrgUnitsFromRows(rows)
    const orgUnitIds = orgUnits.map((item) => item.id)
    const coordinateField = getCoordinateField(config)

    const name = i18n.t('Organisation units')
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

    const mainFeatures = data?.geoFeatures ? toGeoJson(data.geoFeatures) : []
    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            code: WARNING_NO_OU_COORD,
            message: i18n.t('Org unit layer'),
        })
    }

    const levels = await apiFetchOrganisationUnitLevels(engine)

    const loadError = await loadGroupSetData(engine, groupSet, includeGroupSets)

    let associatedGeometries
    if (coordinateField) {
        associatedGeometries = await fetchAssociatedGeometries(engine, {
            orgUnitIds,
            keyAnalysisDisplayProperty,
            includeGroupSets,
            coordinateField,
            userId,
        })

        if (!associatedGeometries?.length) {
            alerts.push({
                code: WARNING_NO_GEOMETRY_COORD,
                message: coordinateField.name,
            })
        }
    }

    const features = addAssociatedGeometries(mainFeatures, associatedGeometries)

    // Styling and Legend
    // -----

    const { styledFeatures, legend } = getStyledOrgUnits({
        features,
        groupSet,
        config,
        baseUrl,
        orgUnitLevels: Object.fromEntries(
            levels.map(({ level, displayName }) => [level, displayName])
        ),
    })

    legend.title = name

    if (groupSet?.id) {
        addGroupCountsToLegend(legend.items, mainFeatures, groupSet)
    } else {
        addLevelCountsToLegend(legend.items, mainFeatures, levels)
    }

    if (config.countFeaturesWithoutCoordinates) {
        await applyMissingCoordsCount(config, {
            engine,
            orgUnitIds,
            userId,
            features: mainFeatures,
            legend,
            alerts,
        })
    }

    return {
        ...config,
        data: styledFeatures,
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

export default orgUnitLoader
