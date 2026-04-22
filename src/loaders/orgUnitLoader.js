import { apiFetchOrganisationUnitLevels } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { parseJsonConfig } from '../util/config.js'
import { toGeoJson } from '../util/map.js'
import {
    ORG_UNITS_GROUP_SET_QUERY,
    addAssociatedGeometries,
    getStyledOrgUnits,
    getCoordinateField,
    parseGroupSet,
    getOrgUnitsWithoutCoordsCount,
    fetchOrgUnitDetails,
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

const orgUnitLoader = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    userId,
    baseUrl,
}) => {
    const { rows, organisationUnitGroupSet: groupSet } = config
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

    const mainFeatures = data?.geoFeatures ? toGeoJson(data.geoFeatures) : []

    const orgUnitLevels = await apiFetchOrganisationUnitLevels(engine)

    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        loadError = await fetchAndParseGroupSet(engine, groupSet)
    }

    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            code: WARNING_NO_OU_COORD,
            message: i18n.t('Org unit layer'),
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

    legend.items.forEach((item) => (item.count = 0))

    if (groupSet?.id) {
        addGroupCountsToLegend(legend.items, mainFeatures, groupSet)
    } else {
        // Level items — match by level number using the orgUnitLevels array
        mainFeatures.forEach((f) => {
            const levelInfo = orgUnitLevels.find(
                (l) => l.level === f.properties.level
            )
            const item =
                levelInfo &&
                legend.items.find((i) => i.name === levelInfo.displayName)
            if (item) {
                item.count++
            }
        })
    }

    if (config.countOrgUnitsWithoutCoordinates) {
        const { count, missingOrgUnits } = await getOrgUnitsWithoutCoordsCount({
            engine,
            orgUnitIds,
            userId,
            features: mainFeatures || [],
        })
        if (count > 0) {
            legend.orgUnitsWithoutCoordinatesCount = count
            const details = await fetchOrgUnitDetails(
                engine,
                missingOrgUnits.map((o) => o.id)
            )
            config.dataWithoutCoords = missingOrgUnits.map((ou) => ({
                ...ou,
                properties: {
                    ...ou.properties,
                    level: details[ou.id]?.level,
                    parentName: details[ou.id]?.parentName,
                },
            }))
        }
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
