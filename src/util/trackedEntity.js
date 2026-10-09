import { getOrgUnitsFromRows } from './analytics.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
    GEO_TYPE_FEATURE,
} from './geojson.js'
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

// Tracker API
// -----

// Row limit of the tracker API, applied even with paging off
// VERSION-TOGGLE: KeyTrackedEntityInstanceMaxLimit deprecated in 2.41 for
// KeyTrackedEntityMaxLimit, which 2.41+ servers apply
export const getTrackerMaxLimit = (systemSettings, serverVersion) => {
    const limit = Number(
        serverSupportsTracker41Api(serverVersion)
            ? systemSettings.KeyTrackedEntityMaxLimit
            : systemSettings.KeyTrackedEntityInstanceMaxLimit
    )
    return limit > 0 ? limit : null
}

const fields = ['trackedEntity~rename(id)', 'geometry']

// Valid geometry types for TEIs
const teiGeometryTypes = new Set([
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
])

const TEI_40_QUERY = {
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

const TEI_41_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        isEnrollmentStatus,
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
        [isEnrollmentStatus ? 'enrollmentStatus' : 'programStatus']:
            programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        paging: false,
    }),
}

export const createTrackedEntityInstanceFeatures = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

const buildQueryVariables = ({
    fields,
    orgUnits,
    orgUnitMode,
    program,
    programStatus,
    followUp,
    trackedEntityType,
    periodType,
    startDate,
    endDate,
}) => {
    // Program status, follow-up and enrollment dates only apply to a program
    const isEnrollmentPeriod = Boolean(program) && periodType === 'program'

    return {
        fields,
        orgUnits,
        orgUnitMode,
        program: program?.id,
        programStatus: program ? programStatus : undefined,
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
    }
}

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
    maxLimit,
}) => {
    const {
        trackedEntityType,
        program,
        programStatus,
        followUp,
        periodType,
        startDate,
        endDate,
        rows,
        organisationUnitSelectionMode,
        relationshipType,
    } = config

    // VERSION-TOGGLE: see util/versionToggle.js
    const isVersion40 = !serverSupportsTracker41Api(serverVersion)

    const orgUnits = getOrgUnitsFromRows(rows)
        .map((ou) => ou.id)
        .join(isVersion40 ? ';' : ',')

    // Slow to fetch, so only for layers showing relationships
    const requestFields = relationshipType
        ? [...fields, 'relationships']
        : fields

    const { trackedEntities } = await engine.query(
        { trackedEntities: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY },
        {
            variables: {
                ...buildQueryVariables({
                    fields: requestFields,
                    orgUnits,
                    orgUnitMode: organisationUnitSelectionMode,
                    program,
                    programStatus,
                    followUp,
                    trackedEntityType,
                    periodType,
                    startDate,
                    endDate,
                }),
                // VERSION-TOGGLE: see util/versionToggle.js
                isEnrollmentStatus:
                    serverSupportsTrackerEnrollmentStatus(serverVersion),
            },
        }
    )

    const allInstances =
        trackedEntities[isVersion40 ? 'instances' : 'trackedEntities']
    const instances = allInstances.filter(
        (instance) =>
            teiGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    return {
        instances,
        // orgUnits is formatted for the relationships request
        orgUnits,
        // No truncation flag from the API: count all rows, geometry or not.
        // A total of exactly the limit also warns, which is still true
        isTruncated: Boolean(maxLimit) && allInstances.length >= maxLimit,
        limit: maxLimit,
    }
}
