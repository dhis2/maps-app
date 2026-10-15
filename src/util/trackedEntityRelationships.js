import {
    createTrackedEntityFeaturesFromTracker,
    TEI_40_QUERY,
    TEI_41_QUERY,
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

const fields = ['trackedEntity~rename(id)', 'geometry', 'relationships']
export const getDataWithRelationships = async ({
    isVersion40,
    instances: sourceInstances,
    queryOptions,
    engine,
}) => {
    const { relationshipType, orgUnits, organisationUnitSelectionMode } =
        queryOptions

    const from = relationshipType.fromConstraint
    const to = relationshipType.toConstraint

    if (
        from.relationshipEntity !== TRACKED_ENTITY_INSTANCE ||
        to.relationshipEntity !== TRACKED_ENTITY_INSTANCE
    ) {
        return []
    }

    const isSameTrackedEntityType =
        from.trackedEntityType.id === to.trackedEntityType.id
    // Same program on both sides, or no program on either side
    const isSameProgram =
        ('program' in from &&
            'program' in to &&
            from?.program?.id === to?.program?.id) ||
        !('program' in from || 'program' in to)
    const isToProgramDefined = 'program' in to

    // Use target as source if from/to TE Types and Programs match, otherwise
    // fetch/re-fetch using program if available TE type otherwise
    let relatedRequestParams = null
    if (!isSameProgram) {
        relatedRequestParams =
            isSameTrackedEntityType && isToProgramDefined
                ? { program: to.program.id } // Same TE type, defined 'to' program
                : { trackedEntityType: to.trackedEntityType.id } // Different TE type, or no 'to' program
    }

    // Keep TEI with coords and convert array to object (id = key)
    const normalizedSourceInstances = normalizeInstances(sourceInstances)

    // Retrieve potential target instances
    let normalizedPotentialTargetInstances
    if (isSameTrackedEntityType && isSameProgram) {
        normalizedPotentialTargetInstances = normalizedSourceInstances
    } else {
        // VERSION-TOGGLE: https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
        const { tei } = await engine.query(
            { tei: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY },
            {
                variables: {
                    fields,
                    orgUnits,
                    orgUnitMode: organisationUnitSelectionMode,
                    ...relatedRequestParams,
                },
            }
        )

        normalizedPotentialTargetInstances = normalizeInstances(
            tei[isVersion40 ? 'instances' : 'trackedEntities']
        )
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
    orgUnits,
}) => {
    const {
        relationshipType: relationshipTypeID,
        organisationUnitSelectionMode,
    } = config

    const { relationshipType } = await engine.query(
        { relationshipType: RELATIONSHIP_TYPES_QUERY },
        { variables: { id: relationshipTypeID } }
    )

    const { relatedEntityType } = await engine.query(
        { relatedEntityType: TRACKED_ENTITY_TYPES_QUERY },
        {
            variables: {
                id: relationshipType.toConstraint.trackedEntityType.id,
            },
        }
    )

    const dataWithRels = await getDataWithRelationships({
        // VERSION-TOGGLE: see util/versionToggle.js
        isVersion40: !serverSupportsTracker41Api(serverVersion),
        instances,
        queryOptions: {
            relationshipType,
            orgUnits,
            organisationUnitSelectionMode,
        },
        engine,
    })

    return {
        data: createTrackedEntityFeaturesFromTracker(dataWithRels.primary),
        relationships: dataWithRels.relationships,
        secondaryData: createTrackedEntityFeaturesFromTracker(
            dataWithRels.secondary
        ),
        relationshipType,
        relatedEntityType,
    }
}
