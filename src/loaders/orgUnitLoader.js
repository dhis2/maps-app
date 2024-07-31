import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import {
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { getDisplayProperty } from '../util/helpers.js'
import { toGeoJson } from '../util/map.js'
import {
    fetchOrgUnitGroupSet,
    addAssociatedGeometries,
    getOrgUnitLevels,
    getStyledOrgUnits,
    getCoordinateField,
} from '../util/orgUnits.js'

const orgUnitLoader = async (config) => {
    const { rows, organisationUnitGroupSet: groupSet } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const orgUnitParams = orgUnits.map((item) => item.id)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)

    const d2 = await getD2()
    const displayProperty = getDisplayProperty(d2).toUpperCase()
    const { contextPath } = d2.system.systemInfo
    const name = i18n.t('Organisation units')
    const alerts = []

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty)

    let associatedGeometries

    const requests = [
        featuresRequest
            .getAll({ includeGroupSets })
            .then(toGeoJson)
            .catch((error) => {
                if (error?.message || error) {
                    alerts.push({
                        code: ERROR_CRITICAL,
                        message: error?.message || error,
                    })
                }
            }),
        getOrgUnitLevels(d2),
    ]

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        requests.push(fetchOrgUnitGroupSet(groupSet.id))
    }

    const [mainFeatures = [], orgUnitLevels, organisationUnitGroups] =
        await Promise.all(requests)

    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            code: WARNING_NO_OU_COORD,
            message: i18n.t('Org unit layer'),
        })
    }

    if (organisationUnitGroups) {
        groupSet.organisationUnitGroups = organisationUnitGroups
    }

    if (coordinateField) {
        associatedGeometries = await featuresRequest
            .getAll({
                coordinateField: coordinateField.id,
                includeGroupSets,
            })
            .then(toGeoJson)

        if (!associatedGeometries.length) {
            alerts.push({
                code: WARNING_NO_GEOMETRY_COORD,
                message: coordinateField.name,
            })
        }
    }

    const features = addAssociatedGeometries(mainFeatures, associatedGeometries)

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        contextPath,
        orgUnitLevels
    )

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
