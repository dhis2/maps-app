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
    addAssociatedGeometries,
    getStyledOrgUnits,
    getCoordinateField,
} from '../util/orgUnits.js'

const SYSTEM_INFO_QUERY = {
    systemInfo: {
        resource: 'system/info',
    },
}

const GEOFEATURES_QUERY = {
    geoFeatures: {
        resource: 'geoFeatures',
        params: ({
            ou,
            displayProperty,
            includeGroupSets,
            coordinateField,
        }) => ({
            ou,
            displayProperty,
            includeGroupSets,
            coordinateField,
        }),
    },
}

const ORGUNIT_GROUPSET_QUERY = {
    organisationUnitGroupSet: {
        resource: 'organisationUnitGroupSets',
        id: ({ groupSetId }) => groupSetId,
        params: {
            fields: 'organisationUnitGroups[id,name,color,symbol]',
        },
    },
}

const orgUnitLoader = async ({ config, engine, displayProperty }) => {
    const { rows, organisationUnitGroupSet: groupSet } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const orgUnitParams = orgUnits.map((item) => item.id)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)

    const { systemInfo } = await engine.query(SYSTEM_INFO_QUERY)
    const contextPath = systemInfo.contextPath
    let associatedGeometries
    const name = i18n.t('Organisation units')
    const alerts = []

    const ouParam = `ou:${orgUnitParams.join(';')}`

    const data = await engine.query(
        GEOFEATURES_QUERY,
        {
            variables: {
                ou: ouParam,
                displayProperty,
                includeGroupSets,
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
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        const organisationUnitGroups = await engine.query(
            ORGUNIT_GROUPSET_QUERY,
            {
                variables: {
                    groupSetId: groupSet.id,
                    includeGroupSets,
                    displayProperty,
                },
            },
            { onError: (error) => console.log('Error loading ouGroups', error) }
        )

        groupSet.organisationUnitGroups = organisationUnitGroups
    }

    // jj just for testing
    // alerts.push({
    //     warning: true,
    //     code: WARNING_NO_OU_COORD,
    //     custom: i18n.t('Org unit layer'),
    // })

    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            code: WARNING_NO_OU_COORD,
            custom: i18n.t('Org unit layer'),
        })
    }

    if (coordinateField) {
        const newdata = await engine.query(
            GEOFEATURES_QUERY,
            {
                variables: {
                    ou: ouParam,
                    displayProperty,
                    includeGroupSets,
                    coordinateField: coordinateField.id,
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
                warning: true,
                code: WARNING_NO_GEOMETRY_COORD,
                custom: coordinateField.name,
            })
        }
    }

    const features = addAssociatedGeometries(mainFeatures, associatedGeometries)

    const { styledFeatures, legend } = getStyledOrgUnits({
        features,
        groupSet,
        config,
        contextPath,
        orgUnitLevels,
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
