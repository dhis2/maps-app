import {
    createTrackedEntityFeatures,
    TEI_40_QUERY,
    TEI_41_QUERY,
    TEI_FIELDS,
} from './trackedEntity.js'
import { serverSupportsTracker41Api } from './versionToggle.js'

const TRACKED_ENTITY_INSTANCE = 'TRACKED_ENTITY_INSTANCE'

const normalizeInstances = (instances) => {
    return instances
        .filter((instance) => !!instance.geometry?.coordinates)
        .reduce((out, instance) => {
            out[instance.id] = instance
            return out
        }, {})
}

export const parseTEInstanceId = (instance) =>
    instance.trackedEntity.trackedEntity

const isValidRel = (rel, type, id) =>
    rel.relationshipType === type &&
    (parseTEInstanceId(rel.from) === id || parseTEInstanceId(rel.to) === id)

const isIndexInstance = (instance, type, targetInstanceIds) => {
    const alwaysBidirectional = false // We might want to have a setting to be able to see relationship no mater if primary is source or target
    let hasChildren = false
    for (const rel of instance.relationships) {
        if (rel.relationshipType !== type) {
            continue
        }

        const toIdMatches = parseTEInstanceId(rel.to) === instance.id
        const fromIdMatches = parseTEInstanceId(rel.from) === instance.id
        if (
            alwaysBidirectional ||
            (!rel.bidirectional && fromIdMatches && !toIdMatches) || // When not bidirectional we want the from id to match
            (rel.bidirectional && (fromIdMatches || toIdMatches)) // When bidirectional it can be either from or to id that matches
        ) {
            hasChildren = true
            if (fromIdMatches) {
                targetInstanceIds.push(parseTEInstanceId(rel.to))
            } else {
                targetInstanceIds.push(parseTEInstanceId(rel.from))
            }
        }
    }
    return hasChildren
}

/* eslint-disable max-params */
const getInstanceRelationships = (
    relationshipsById,
    from,
    targetInstances,
    type
) => {
    const alwaysBidirectional = false // We might want to have a setting to be able to see relationship no mater if primary is source or target
    const localRels = from.relationships.filter((rel) =>
        isValidRel(rel, type, from.id)
    )

    localRels.forEach((rel) => {
        const id = rel.relationship
        const bidirectional = rel.bidirectional || alwaysBidirectional
        if (relationshipsById[id]) {
            return
        }
        const to = targetInstances[parseTEInstanceId(rel.to)]
        if (to && from.id !== to.id) {
            relationshipsById[id] = {
                id,
                from,
                to,
                bidirectional: !!bidirectional,
            }
        } else {
            const reversedTo = targetInstances[parseTEInstanceId(rel.from)]
            if (reversedTo && from.id !== reversedTo.id && bidirectional) {
                relationshipsById[id] = {
                    id,
                    from,
                    reversedTo,
                    bidirectional: true,
                }
            }
        }
    })
}
/* eslint-enable max-params */

// Related tracked entities are requested with the relationship type's "to"
// program, or its "to" type without one. Same org units and period as the
// layer, no program status or follow-up
const getRelatedParams = (trackerParams, to) => {
    const params = {
        ...trackerParams,
        fields: TEI_FIELDS,
        programStatus: undefined,
        enrollmentStatus: undefined,
        followUp: undefined,
    }

    if ('program' in to) {
        return {
            ...params,
            program: to.program.id,
            trackedEntityType: undefined,
        }
    }

    // Enrollment dates need a program, so they become last updated dates
    return {
        ...params,
        program: undefined,
        trackedEntityType: to.trackedEntityType.id,
        enrollmentEnrolledAfter: undefined,
        enrollmentEnrolledBefore: undefined,
        updatedAfter:
            trackerParams.updatedAfter ?? trackerParams.enrollmentEnrolledAfter,
        updatedBefore:
            trackerParams.updatedBefore ??
            trackerParams.enrollmentEnrolledBefore,
    }
}

export const getDataWithRelationships = async ({
    isVersion40,
    instances: sourceInstances,
    queryOptions,
    engine,
    maxLimit,
    isSourceTruncated,
}) => {
    const { relationshipType, trackerParams } = queryOptions

    const from = relationshipType.fromConstraint
    const to = relationshipType.toConstraint

    if (
        // No tracked entities: nothing to relate, and their org units may be
        // empty, which the tracker API reads as all accessible ones
        !sourceInstances.length ||
        // Only relationships between tracked entities can be shown
        from.relationshipEntity !== TRACKED_ENTITY_INSTANCE ||
        to.relationshipEntity !== TRACKED_ENTITY_INSTANCE
    ) {
        return {
            primary: Object.values(normalizeInstances(sourceInstances)),
            relationships: [],
            secondary: [],
        }
    }

    // The related tracked entities are on the map when they are of the layer's
    // type, in the layer program if it has one, and not filtered out by program
    // status or follow-up, which don't apply to them
    const isRelatedLoaded =
        to.trackedEntityType.id === from.trackedEntityType.id &&
        (!trackerParams.program || to.program?.id === trackerParams.program) &&
        !trackerParams.programStatus &&
        !trackerParams.enrollmentStatus &&
        !trackerParams.followUp

    // Keep TEI with coords and convert array to object (id = key)
    const normalizedSourceInstances = normalizeInstances(sourceInstances)

    // Retrieve potential target instances
    let normalizedPotentialTargetInstances
    let isTruncated = false
    if (isRelatedLoaded) {
        // The related tracked entities are among the loaded ones, so cut
        // with them
        normalizedPotentialTargetInstances = normalizedSourceInstances
        isTruncated = Boolean(isSourceTruncated)
    } else {
        // VERSION-TOGGLE: https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
        const { tei } = await engine.query(
            { tei: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY },
            { variables: getRelatedParams(trackerParams, to) }
        )

        const potentialTargetInstances =
            tei[isVersion40 ? 'instances' : 'trackedEntities']
        normalizedPotentialTargetInstances = normalizeInstances(
            potentialTargetInstances
        )
        // Capped by the tracker API limit like the source instances
        isTruncated =
            Boolean(maxLimit) && potentialTargetInstances.length >= maxLimit
    }

    const targetInstanceIds = []
    // Keep TEI with relationship of correct type
    // Store Ids of target relationships
    const filteredSourceInstances = sourceInstances.filter((instance) =>
        isIndexInstance(instance, relationshipType.id, targetInstanceIds)
    )

    const relationshipsById = {}
    // Create relationship objects
    filteredSourceInstances.forEach((instance) =>
        getInstanceRelationships(
            relationshipsById,
            instance,
            normalizedPotentialTargetInstances,
            relationshipType.id
        )
    )

    // Keep only instances that are the target of a relationship
    const targetInstances = Object.values(
        normalizedPotentialTargetInstances
    ).filter((instance) => targetInstanceIds.includes(instance.id))

    return {
        primary: Object.values(normalizedSourceInstances),
        relationships: Object.values(relationshipsById),
        secondary: targetInstances,
        isTruncated,
    }
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

// The instances must include their relationships
export const loadTrackedEntityRelationships = async ({
    config,
    engine,
    serverVersion,
    instances,
    trackerParams,
    maxLimit,
    isSourceTruncated,
}) => {
    const { relationshipType: relationshipTypeID } = config

    const { relationshipType } = await engine.query(
        { relationshipType: RELATIONSHIP_TYPES_QUERY },
        { variables: { id: relationshipTypeID } }
    )

    // Relationships to events or enrollments have no related type
    const relatedEntityTypeId =
        relationshipType.toConstraint.trackedEntityType?.id
    const { relatedEntityType } = relatedEntityTypeId
        ? await engine.query(
              { relatedEntityType: TRACKED_ENTITY_TYPES_QUERY },
              { variables: { id: relatedEntityTypeId } }
          )
        : {}

    const dataWithRels = await getDataWithRelationships({
        // VERSION-TOGGLE: see util/versionToggle.js
        isVersion40: !serverSupportsTracker41Api(serverVersion),
        instances,
        queryOptions: { relationshipType, trackerParams },
        engine,
        maxLimit,
        isSourceTruncated,
    })

    return {
        data: createTrackedEntityFeatures(dataWithRels.primary),
        relationships: dataWithRels.relationships,
        secondaryData: createTrackedEntityFeatures(dataWithRels.secondary),
        relationshipType,
        relatedEntityType,
        isTruncated: dataWithRels.isTruncated,
        // Only relationships between tracked entities can be shown
        isSupported:
            relationshipType.fromConstraint.relationshipEntity ===
                TRACKED_ENTITY_INSTANCE &&
            relationshipType.toConstraint.relationshipEntity ===
                TRACKED_ENTITY_INSTANCE,
    }
}
