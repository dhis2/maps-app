import i18n from '@dhis2/d2-i18n'
import {
    WARNING_NO_FACILITY_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { toGeoJson } from '../util/map.js'
import {
    getPointItems,
    getPolygonItems,
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

const facilityLoader = async ({ config, engine, displayProperty }) => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const includeGroupSets = !!groupSet
    const coordinateField = getCoordinateField(config)
    const alerts = []
    const orgUnitParams = orgUnits.map((item) => item.id)
    let associatedGeometries
    const name = i18n.t('Facilities')

    const { systemInfo } = await engine.query(SYSTEM_INFO_QUERY)
    const contextPath = systemInfo.contextPath

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

    const features = data?.geoFeatures
        ? toGeoJson(getPointItems(data.geoFeatures))
        : null

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        const organisationUnitGroups = await engine.query(
            ORGUNIT_GROUPSET_QUERY,
            {
                variables: {
                    groupSetId: groupSet?.id,
                    includeGroupSets,
                    displayProperty,
                },
            },
            { onError: (error) => console.log('Error loading ouGroups', error) }
        )

        groupSet.organisationUnitGroups = organisationUnitGroups
    }

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        contextPath
    )

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
            ? toGeoJson(getPolygonItems(newdata.geoFeatures))
            : null

        if (!associatedGeometries.length) {
            alerts.push({
                warning: true,
                code: WARNING_NO_GEOMETRY_COORD,
                custom: coordinateField.name,
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

    legend.title = name

    if (!styledFeatures.length) {
        alerts.push({
            warning: true,
            code: WARNING_NO_FACILITY_COORD,
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
