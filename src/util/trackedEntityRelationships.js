import { createTrackedEntityInstanceFeatures } from './trackedEntity.js'
import { serverSupportsTracker41Api } from './versionToggle.js'

const TRACKED_ENTITY_INSTANCE = 'TRACKED_ENTITY_INSTANCE'

// Related instances (tracker API)
// -----

// VERSION-TOGGLE: tracker API params changed in 2.41 - remove TEI_40_QUERY
// when 2.41 is the lowest supported version, see util/versionToggle.js
const TEI_40_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        trackedEntityType,
    }) => ({
        fields,
        orgUnit: orgUnits,
        ouMode: orgUnitMode,
        program: program,
        trackedEntityType,
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
        trackedEntityType,
    }) => ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        trackedEntityType,
        paging: false,
    }),
}

// Relationship parsing
// -----

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
                    bidirectional: !!bidirectional,
                }
            }
        }
    })
}
/* eslint-enable max-params */

const fields = ['trackedEntity~rename(id)', 'geometry', 'relationships']
export const getDataWithRelationships = async ({
    serverVersion,
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

    const isRecursiveTrackedEntityType =
        from.trackedEntityType.id === to.trackedEntityType.id
    const isRecursiveProgram = // program specified and same in both or not specified in both
        ('program' in from &&
            'program' in to &&
            from?.program?.id === to?.program?.id) ||
        !('program' in from || 'program' in to)
    const isToProgramDefined = 'program' in to

    // Use target as source if from/to TE Types and Programs match, otherwise
    // fetch/re-fetch using program if available TE type otherwise
    let recursiveProp = null
    if (
        isRecursiveTrackedEntityType && // Same TE Type
        !isRecursiveProgram && // Different Program
        isToProgramDefined // Defined 'To' Program
    ) {
        recursiveProp = {
            program: to.program.id,
        }
    } else if (
        isRecursiveTrackedEntityType && // Same TE Type
        !isRecursiveProgram && // Different Program
        !isToProgramDefined // Not Defined 'To' Program
    ) {
        recursiveProp = {
            type: to.trackedEntityType,
        }
    } else if (
        !isRecursiveTrackedEntityType && // Different TE Type
        !isRecursiveProgram // Different Program
    ) {
        recursiveProp = {
            type: to.trackedEntityType,
        }
    }

    // Keep TEI with coords and convert array to object (id = key)
    const normalizedSourceInstances = normalizeInstances(sourceInstances)

    // Retrieve potential target instances
    let normalizedPotentialTargetInstances
    if (isRecursiveTrackedEntityType & isRecursiveProgram) {
        normalizedPotentialTargetInstances = normalizedSourceInstances
    } else {
        // VERSION-TOGGLE: see util/versionToggle.js
        const isTracker41Api = serverSupportsTracker41Api(serverVersion)
        const { tei } = await engine.query(
            { tei: isTracker41Api ? TEI_41_QUERY : TEI_40_QUERY },
            {
                variables: {
                    fields,
                    orgUnits,
                    orgUnitMode: organisationUnitSelectionMode,
                    program: recursiveProp?.program,
                    trackedEntityType: recursiveProp?.type?.id,
                },
            }
        )

        normalizedPotentialTargetInstances = normalizeInstances(
            tei[isTracker41Api ? 'trackedEntities' : 'instances']
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

// Loading
// -----

const RELATIONSHIP_TYPE_QUERY = {
    resource: 'relationshipTypes',
    id: ({ id }) => id,
}

const TRACKED_ENTITY_TYPE_QUERY = {
    resource: 'trackedEntityTypes',
    id: ({ id }) => id,
    params: {
        fields: 'displayName,featureType',
    },
}

// Instances from loadTrackedEntitiesFromTracker include their relationships
export const loadTrackedEntityRelationships = async ({
    config,
    engine,
    serverVersion,
    instances,
    orgUnits,
}) => {
    const {
        relationshipType: relationshipTypeId,
        organisationUnitSelectionMode,
    } = config

    const { relationshipType } = await engine.query(
        { relationshipType: RELATIONSHIP_TYPE_QUERY },
        { variables: { id: relationshipTypeId } }
    )

    const { relatedEntityType } = await engine.query(
        { relatedEntityType: TRACKED_ENTITY_TYPE_QUERY },
        {
            variables: {
                id: relationshipType.toConstraint.trackedEntityType.id,
            },
        }
    )

    const { primary, relationships, secondary } =
        await getDataWithRelationships({
            serverVersion,
            instances,
            queryOptions: {
                relationshipType,
                orgUnits,
                organisationUnitSelectionMode,
            },
            engine,
        })

    return {
        data: createTrackedEntityInstanceFeatures(primary),
        relationships,
        secondaryData: createTrackedEntityInstanceFeatures(secondary),
        relationshipType,
        relatedEntityType,
    }
}
