import i18n from '@dhis2/d2-i18n'
import { WARNING_NO_DATA } from '../constants/alerts.js'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
} from '../constants/layers.js'
import { getProgramStatuses } from '../constants/programStatuses.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
    GEO_TYPE_LINE,
    GEO_TYPE_FEATURE,
} from '../util/geojson.js'
import { getDataWithRelationships } from '../util/teiRelationshipsParser.js'
import { trimTime, formatStartEndDate, getDateArray } from '../util/time.js'

const fields = ['trackedEntity~rename(id)', 'geometry']

// Valid geometry types for TEIs
const teiGeometryTypes = [
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
]

const TEI_240_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
    }) => ({
        fields,
        orgUnit: orgUnits,
        ouMode: orgUnitMode,
        program: program,
        programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        skipPaging: true,
    }),
}

const TEI_241_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        // TODO no followUp?
    }) => ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        paging: false,
    }),
}

const RELATIONSHIP_TYPES_QUERY = {
    resource: 'relationshipTypes',
    id: ({ id }) => id,
}

const TRACKED_ENTITY_TYPES_QUERY = {
    resource: 'trackedEntityTypes',
    id: ({ id }) => id,
    params: {
        fields: 'displayName,featureType',
    },
}

//TODO: Refactor to share code with other loaders
const trackedEntityLoader = async ({ config, serverVersion, engine }) => {
    if (config.config && typeof config.config === 'string') {
        try {
            const customConfig = JSON.parse(config.config)
            config.relationshipType = customConfig.relationships.type
            config.relatedPointColor = customConfig.relationships.pointColor
            config.relatedPointRadius = customConfig.relationships.pointRadius
            config.relationshipLineColor = customConfig.relationships.lineColor
            config.relationshipOutsideProgram =
                customConfig.relationships.relationshipOutsideProgram
            config.periodType = customConfig.periodType
        } catch (e) {
            // Failed to load JSON relationship config, assuming no relationships
        }
        delete config.config
    }

    const {
        trackedEntityType,
        program,
        programStatus,
        followUp,
        relationshipType: relationshipTypeID,
        periodType,
        startDate,
        endDate,
        rows,
        organisationUnitSelectionMode,
        eventPointColor,
        eventPointRadius,
        areaRadius,
        relatedPointColor,
        relatedPointRadius,
        relationshipLineColor,
    } = config

    const name = program ? program.name : i18n.t('Tracked entity')

    const legend = {
        title: name,
        period: formatStartEndDate(
            getDateArray(startDate),
            getDateArray(endDate)
        ),
        items: [
            {
                name:
                    trackedEntityType.name +
                    (areaRadius ? ` + ${areaRadius} ${'m'} ${'buffer'}` : ''),
                color: eventPointColor || TEI_COLOR,
                radius: eventPointRadius || TEI_RADIUS,
            },
        ],
    }

    // VERSION-TOGGLE: https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
    const isVersion240 =
        `${serverVersion.major}.${serverVersion.minor}` === '2.40'

    const trackerRootProp = isVersion240 ? 'instances' : 'trackedEntities'

    const orgUnits = getOrgUnitsFromRows(rows)
        .map((ou) => ou.id)
        .join(isVersion240 ? ';' : ',')

    const fieldsWithRelationships = [...fields, 'relationships']
    let explanation
    let boolFollowUp = undefined

    if (program && programStatus) {
        explanation = `${i18n.t('Program status')}: ${
            getProgramStatuses().find((s) => s.id === programStatus).name
        }`
    }

    if (program && followUp !== undefined) {
        boolFollowUp = followUp ? 'TRUE' : 'FALSE'
    }

    const { trackedEntities } = await engine.query(
        { trackedEntities: isVersion240 ? TEI_240_QUERY : TEI_241_QUERY },
        {
            variables: {
                fields: fieldsWithRelationships,
                orgUnits: orgUnits,
                orgUnitMode: organisationUnitSelectionMode,
                program: program?.id,
                programStatus,
                followUp: boolFollowUp,
                trackedEntityType: !program ? trackedEntityType?.id : undefined,
                enrollmentEnrolledAfter:
                    periodType === 'program' ? trimTime(startDate) : undefined,
                enrollmentEnrolledBefore:
                    periodType === 'program' ? trimTime(endDate) : undefined,
                updatedAfter:
                    periodType !== 'program' ? trimTime(startDate) : undefined,
                updatedBefore:
                    periodType !== 'program' ? trimTime(endDate) : undefined,
            },
        }
    )

    const instances = trackedEntities[trackerRootProp].filter(
        (instance) =>
            teiGeometryTypes.includes(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    let alert

    if (!instances.length) {
        alert = {
            code: WARNING_NO_DATA,
            message: trackedEntityType.name,
        }
    }

    let data, relationships, secondaryData

    if (relationshipTypeID) {
        const { relationshipType } = await engine.query(
            { relationshipType: RELATIONSHIP_TYPES_QUERY },
            {
                variables: {
                    id: relationshipTypeID,
                },
            }
        )

        const { relatedEntityType } = await engine.query(
            { relatedEntityType: TRACKED_ENTITY_TYPES_QUERY },
            {
                variables: {
                    id: relationshipType.toConstraint.trackedEntityType.id,
                },
            }
        )

        const isPoint =
            relatedEntityType.featureType === GEO_TYPE_POINT.toUpperCase()

        legend.items.push(
            {
                type: GEO_TYPE_LINE,
                name: relationshipType.displayName,
                color: relationshipLineColor || TEI_RELATIONSHIP_LINE_COLOR,
                weight: 1,
            },
            {
                name: `${relatedEntityType.displayName} (${i18n.t('related')})`,
                color: relatedPointColor || TEI_RELATED_COLOR,
                radius: isPoint
                    ? relatedPointRadius || TEI_RELATED_RADIUS
                    : undefined,
                weight: !isPoint ? 1 : undefined,
            }
        )

        const dataWithRels = await getDataWithRelationships({
            serverVersion,
            instances,
            queryOptions: {
                relationshipType,
                orgUnits,
                organisationUnitSelectionMode,
            },
            engine,
        })

        data = toGeoJson(dataWithRels.primary)
        relationships = dataWithRels.relationships
        secondaryData = toGeoJson(dataWithRels.secondary)
    } else {
        data = toGeoJson(instances)
    }

    if (explanation) {
        legend.explanation = [explanation]
    }

    return {
        ...config,
        name,
        data,
        relationships,
        secondaryData,
        legend,
        ...(alert ? { alerts: [alert] } : {}),
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
    }
}

const toGeoJson = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

export default trackedEntityLoader
