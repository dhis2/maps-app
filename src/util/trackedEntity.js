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
    { fields, orgUnits, orgUnitMode, serverVersion }
) => {
    // Program status, follow-up and enrollment dates only apply to a program
    const isEnrollmentPeriod = Boolean(program) && periodType === 'program'
    // VERSION-TOGGLE: see util/versionToggle.js
    const statusParam = serverSupportsTrackerEnrollmentStatus(serverVersion)
        ? 'enrollmentStatus'
        : 'programStatus'

    return {
        fields,
        orgUnits,
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
    }
}

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
    maxLimit,
}) => {
    const { rows, organisationUnitSelectionMode, relationshipType } = config

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
            variables: getTrackerRequestVariables(config, {
                fields: requestFields,
                orgUnits,
                orgUnitMode: organisationUnitSelectionMode,
                serverVersion,
            }),
        }
    )

    const allInstances =
        trackedEntities[isVersion40 ? 'instances' : 'trackedEntities']
    const instances = allInstances.filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    return {
        instances,
        // orgUnits is formatted for the relationships request
        orgUnits,
        // The API returns at most maxLimit rows and no total, so reaching the
        // limit is the only sign of a cut (a total of exactly maxLimit also
        // warns). All rows count, geometry or not
        isTruncated: Boolean(maxLimit) && allInstances.length >= maxLimit,
        limit: maxLimit,
    }
}
