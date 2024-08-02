import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
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

const facilityLoader = async ({ config, engine, nameProperty, baseUrl }) => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)
    const alerts = []
    const orgUnitParams = orgUnits.map((item) => item.id)
    let associatedGeometries

    const d2 = await getD2()
    const name = i18n.t('Facilities')

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(nameProperty)

    const requests = [
        featuresRequest
            .getAll({
                includeGroupSets,
            })
            .then(getPointItems)
            .then(toGeoJson)
            .catch((error) => {
                if (error?.message || error) {
                    alerts.push({
                        code: ERROR_CRITICAL,
                        message: error.message,
                    })
                }
            }),
    ]

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        const orgUnitGroupsRequest = engine.query(ORG_UNITS_GROUP_SET_QUERY, {
            variables: { id: groupSet.id },
        })
        requests.push(orgUnitGroupsRequest)
    }

    const [features, orgUnitGroups] = await Promise.all(requests)

    if (orgUnitGroups) {
        const { groupSets } = orgUnitGroups
        groupSet.organisationUnitGroups = parseGroupSet({
            organisationUnitGroups: groupSets.organisationUnitGroups,
        })
    }

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        baseUrl
    )

    legend.title = name

    if (coordinateField) {
        associatedGeometries = await featuresRequest
            .getAll({
                coordinateField: coordinateField.id,
                includeGroupSets,
            })
            .then(getPolygonItems)
            .then(toGeoJson)

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
    }
}

export default facilityLoader
