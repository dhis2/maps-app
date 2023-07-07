import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { getDisplayProperty } from '../util/helpers.js'
import { toGeoJson } from '../util/map.js'
import {
    fetchOrgUnitGroupSet,
    getPointItems,
    getPolygonItems,
    getStyledOrgUnits,
    getCoordinateField,
} from '../util/orgUnits.js'

export const WARNING_NO_DATA = 'WARNING_NO_DATA'
export const WARNING_NO_FACILITY_COORDINATES = 'WARNING_NO_FACILITY_COORDINATES'
export const WARNING_NO_GEOMETRY_COORDINATES = 'WARNING_NO_GEOMETRY_COORDINATES'
export const ERROR_CRITICAL = 'ERROR_CRITICAL'

const facilityLoader = async (config) => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)
    const alerts = []
    const orgUnitParams = orgUnits.map((item) => item.id)
    let associatedGeometries

    const d2 = await getD2()
    const displayProperty = getDisplayProperty(d2).toUpperCase()
    const { contextPath } = d2.system.systemInfo
    const name = i18n.t('Facilities')

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty)

    const requests = [
        featuresRequest
            .getAll({
                includeGroupSets,
            })
            .then(getPointItems)
            .then(toGeoJson)
            .catch((error) => {
                if (error && error.message) {
                    alerts.push({
                        critical: true,
                        code: ERROR_CRITICAL,
                        message: i18n.t('Error: {{message}}', {
                            message: error.message,
                            nsSeparator: ';',
                        }),
                    })
                }
            }),
    ]

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        requests.push(fetchOrgUnitGroupSet(groupSet.id))
    }

    const [features, organisationUnitGroups] = await Promise.all(requests)

    if (organisationUnitGroups) {
        groupSet.organisationUnitGroups = organisationUnitGroups
    }

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        contextPath
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
                warning: true,
                code: WARNING_NO_GEOMETRY_COORDINATES,
                message: i18n.t('{{name}}: No coordinates found', {
                    name: coordinateField.name,
                    nsSeparator: ';',
                }),
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
            code: WARNING_NO_FACILITY_COORDINATES,
            message: i18n.t('Facilities: No coordinates found', {
                nsSeparator: ';',
            }),
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
