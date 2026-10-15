import { getOrgUnitsFromRows } from './analytics.js'
import { GEO_TYPE_FEATURE, trackedEntityGeometryTypes } from './geojson.js'
import { trimTime } from './time.js'
import {
    serverSupportsTracker41Api,
    serverSupportsTrackerEnrollmentStatus,
} from './versionToggle.js'

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

// Features from tracked entities with an id and a geometry
export const createTrackedEntityFeatures = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

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
        enrollmentStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
    }) => ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        enrollmentStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        paging: false,
    }),
}

const getTrackerRequest = (
    {
        program,
        programStatus,
        followUp,
        trackedEntityType,
        periodType,
        startDate,
        endDate,
    },
    { fields, orgUnitIds, orgUnitMode, serverVersion }
) => {
    // VERSION-TOGGLE: see util/versionToggle.js
    const isVersion40 = !serverSupportsTracker41Api(serverVersion)
    // Program status, follow-up and enrollment dates only apply to a program
    const isEnrollmentPeriod = Boolean(program) && periodType === 'program'
    // VERSION-TOGGLE: see util/versionToggle.js
    const statusParam = serverSupportsTrackerEnrollmentStatus(serverVersion)
        ? 'enrollmentStatus'
        : 'programStatus'

    return {
        query: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY,
        variables: {
            fields,
            orgUnits: orgUnitIds.join(isVersion40 ? ';' : ','),
            orgUnitMode,
            program: program?.id,
            [statusParam]: program ? programStatus : undefined,
            // Unchecked means no filter, not "not marked for follow-up"
            followUp: program && followUp ? 'TRUE' : undefined,
            trackedEntityType: program ? undefined : trackedEntityType?.id,
            enrollmentEnrolledAfter: isEnrollmentPeriod
                ? trimTime(startDate)
                : undefined,
            enrollmentEnrolledBefore: isEnrollmentPeriod
                ? trimTime(endDate)
                : undefined,
            updatedAfter: isEnrollmentPeriod ? undefined : trimTime(startDate),
            updatedBefore: isEnrollmentPeriod ? undefined : trimTime(endDate),
        },
    }
}

// All tracked entities of the response, with or without geometry
// VERSION-TOGGLE: see util/versionToggle.js
const getTrackerRows = (response, serverVersion) =>
    response[
        serverSupportsTracker41Api(serverVersion)
            ? 'trackedEntities'
            : 'instances'
    ]

// Tracked entities with a geometry that can be drawn
const getTrackerInstances = (response, serverVersion) =>
    getTrackerRows(response, serverVersion).filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
}) => {
    const { query, variables } = getTrackerRequest(config, {
        fields: [...fields, 'relationships'],
        orgUnitIds: getOrgUnitsFromRows(config.rows).map((ou) => ou.id),
        orgUnitMode: config.organisationUnitSelectionMode,
        serverVersion,
    })
    const { trackedEntities: response } = await engine.query(
        { trackedEntities: query },
        { variables }
    )
    const instances = getTrackerInstances(response, serverVersion)

    // orgUnits is formatted for the relationships request
    return { instances, orgUnits: variables.orgUnits }
}
