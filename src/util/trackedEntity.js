import { getOrgUnitsFromRows } from './analytics.js'
import { GEO_TYPE_FEATURE, trackedEntityGeometryTypes } from './geojson.js'
import { trimTime } from './time.js'
import { serverSupportsTracker41Api } from './versionToggle.js'

export const TRACKED_ENTITY_TRACKED_ENTITY_TYPE_ATTRIBUTES_QUERY = {
    trackedEntityType: {
        resource: 'trackedEntityTypes',
        id: ({ id }) => id,
        params: ({ nameProperty }) => ({
            fields: `trackedEntityTypeAttributes[displayInList,trackedEntityAttribute[id,${nameProperty}~rename(name),optionSet,valueType]]`,
            paging: false,
        }),
    },
}

export const TRACKED_ENTITY_PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY = {
    program: {
        resource: 'programs',
        id: ({ id }) => id,
        params: ({ nameProperty }) => ({
            fields: `programTrackedEntityAttributes[displayInList,trackedEntityAttribute[id,${nameProperty}~rename(name),optionSet,valueType]]`,
            paging: false,
        }),
    },
}

// Tracker API
// -----

const fields = ['trackedEntity~rename(id)', 'geometry']

// Also used for the related tracked entities of relationship layers
export const TEI_40_QUERY = {
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

export const TEI_41_QUERY = {
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

export const createTrackedEntityFeaturesFromTracker = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

const getTrackerRequestVariables = (
    {
        program,
        programStatus,
        followUp,
        trackedEntityType,
        periodType,
        startDate,
        endDate,
    },
    { fields, orgUnits, orgUnitMode }
) => {
    const followUpBool = followUp ? 'TRUE' : 'FALSE'
    const boolFollowUp =
        program && followUp !== undefined ? followUpBool : undefined

    return {
        fields,
        orgUnits,
        orgUnitMode,
        program: program?.id,
        programStatus,
        followUp: boolFollowUp,
        trackedEntityType: program ? undefined : trackedEntityType?.id,
        enrollmentEnrolledAfter:
            periodType === 'program' ? trimTime(startDate) : undefined,
        enrollmentEnrolledBefore:
            periodType === 'program' ? trimTime(endDate) : undefined,
        updatedAfter:
            periodType === 'program' ? undefined : trimTime(startDate),
        updatedBefore: periodType === 'program' ? undefined : trimTime(endDate),
    }
}

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
}) => {
    const { rows, organisationUnitSelectionMode } = config

    // VERSION-TOGGLE: see util/versionToggle.js
    const isVersion40 = !serverSupportsTracker41Api(serverVersion)

    const orgUnits = getOrgUnitsFromRows(rows)
        .map((ou) => ou.id)
        .join(isVersion40 ? ';' : ',')

    const fieldsWithRelationships = [...fields, 'relationships']

    const { trackedEntities } = await engine.query(
        { trackedEntities: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY },
        {
            variables: getTrackerRequestVariables(config, {
                fields: fieldsWithRelationships,
                orgUnits,
                orgUnitMode: organisationUnitSelectionMode,
            }),
        }
    )

    const instances = trackedEntities[
        isVersion40 ? 'instances' : 'trackedEntities'
    ].filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    // orgUnits is formatted for the relationships request
    return { instances, orgUnits }
}
