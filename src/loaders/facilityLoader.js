import i18n from '@dhis2/d2-i18n'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { toGeoJson } from '../util/map.js'
import {
    fetchOrgUnitGroupSet,
    filterPointFacilities,
    getStyledOrgUnits,
    getCoordinateField,
} from '../util/orgUnits.js'

const facilityLoader = async (config, { displayProperty, d2 }) => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)
    const alerts = []
    const orgUnitParams = orgUnits.map((item) => item.id)
    let associatedGeometries

    const { contextPath } = d2.system.systemInfo
    const name = i18n.t('Facilities')

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty.toUpperCase())

    const requests = [
        featuresRequest
            .getAll({
                includeGroupSets,
            })
            .then(filterPointFacilities)
            .then(toGeoJson)
            .catch((error) => {
                if (error && error.message) {
                    alerts.push({
                        critical: true,
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
            .then(toGeoJson)

        if (!associatedGeometries.length) {
            alerts.push({
                warning: true,
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
        isExpanded: true,
        isVisible: true,
    }
}

export default facilityLoader
