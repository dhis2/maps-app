import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { toGeoJson } from '../util/map.js'
import {
    ORG_UNITS_GROUP_SET_QUERY,
    addAssociatedGeometries,
    getStyledOrgUnits,
    getCoordinateField,
    parseGroupSet,
} from '../util/orgUnits.js'

// orgUnitLevels do not have shortName property
const ORG_UNIT_LEVELS_QUERY = {
    orgUnitLevels: {
        resource: 'organisationUnitLevels',
        params: {
            fields: 'id,level,displayName~rename(name)',
            paging: false,
        },
    },
}

const orgUnitLoader = async ({ config, engine, nameProperty, baseUrl }) => {
    const { rows, organisationUnitGroupSet: groupSet } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const orgUnitParams = orgUnits.map((item) => item.id)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)

    const d2 = await getD2()
    const name = i18n.t('Organisation units')
    const alerts = []

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(nameProperty)

    let associatedGeometries

    const requests = [
        featuresRequest
            .getAll({ includeGroupSets })
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

    const levelsRequest = engine.query(ORG_UNIT_LEVELS_QUERY)
    requests.push(levelsRequest)

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        const orgUnitGroupsRequest = engine.query(ORG_UNITS_GROUP_SET_QUERY, {
            variables: { id: groupSet.id },
        })
        requests.push(orgUnitGroupsRequest)
    }

    const [mainFeatures = [], { orgUnitLevels }, orgUnitGroups] =
        await Promise.all(requests)

    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            warning: true,
            message: i18n.t('Selected org units: No coordinates found', {
                nsSeparator: ';',
            }),
        })
    }

    if (orgUnitGroups) {
        const { groupSets } = orgUnitGroups
        groupSet.organisationUnitGroups = parseGroupSet({
            organisationUnitGroups: groupSets.organisationUnitGroups,
        })
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
                warning: true,
                message: i18n.t('{{name}}: No coordinates found', {
                    name: coordinateField.name,
                    nsSeparator: ';',
                }),
            })
        }
    }

    const features = addAssociatedGeometries(mainFeatures, associatedGeometries)

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        baseUrl,
        orgUnitLevels.organisationUnitLevels.reduce(
            (obj, item) => ({
                ...obj,
                [item.level]: item.name,
            }),
            {}
        )
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
