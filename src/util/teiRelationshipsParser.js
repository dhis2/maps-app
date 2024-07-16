import { apiFetch } from './api.js'

const TRACKED_ENTITY_INSTANCE = 'TRACKED_ENTITY_INSTANCE'

export const fetchTEIs = async ({
    program,
    type,
    orgUnits,
    fields,
    organisationUnitSelectionMode,
}) => {
    let url = `/trackedEntityInstances?skipPaging=true&fields=${fields}&ou=${orgUnits}`
    if (organisationUnitSelectionMode) {
        url += `&ouMode=${organisationUnitSelectionMode}`
    }
    if (program) {
        url += `&program=${program}`
    }
    if (type) {
        url += `&trackedEntityType=${type.id}`
    }

    const data = await apiFetch(url)

    return data.trackedEntityInstances
}

const normalizeInstances = (instances) => {
    return instances
        .filter((instance) => !!instance.coordinates)
        .reduce((out, instance) => {
            out[instance.id] = instance
            return out
        }, {})
}

export const parseTEInstanceId = (instance) =>
    instance.trackedEntityInstance.trackedEntityInstance

const isValidRel = (rel, type, id) =>
    rel.relationshipType === type && parseTEInstanceId(rel.from) === id

const isIndexInstance = (instance, type, targetInstanceIds) => {
    let hasChildren = false
    for (let i = 0; i < instance.relationships.length; ++i) {
        const rel = instance.relationships[i]
        if (rel.relationshipType !== type) {
            continue
        }

        const toIdMatches = parseTEInstanceId(rel.to) === instance.id
        const fromIdMatches = parseTEInstanceId(rel.from) === instance.id
        if (
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
    type,
    isRecursive
) => {
    const localRels = from.relationships.filter((rel) =>
        isValidRel(rel, type, from.id)
    )

    localRels.forEach((rel) => {
        const id = rel.relationship
        if (relationshipsById[id]) {
            return
        }
        const to = targetInstances[parseTEInstanceId(rel.to)]
        if (!to) {
            // console.error('NOT FOUND', rel.to);
            return
        }
        relationshipsById[id] = {
            id,
            from,
            to,
        }
        if (isRecursive) {
            getInstanceRelationships(
                relationshipsById,
                to,
                targetInstances,
                type,
                true
            )
        }
    })
}
/* eslint-enable max-params */

const fields = [
    'trackedEntityInstance~rename(id)',
    'featureType',
    'coordinates',
    'relationships',
]
export const getDataWithRelationships = async (
    sourceInstances,
    relationshipType,
    { orgUnits, organisationUnitSelectionMode }
) => {
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
    const isRecursiveProgram =
        'program' in from &&
        'program' in to &&
        from?.program?.id === to?.program?.id
    const isToProgramDefined = 'program' in to

    // Use target as source if from/to TE Types and Programs match, otherwise
    // fetch/re-fetch using program if available TE type otherwise
    let recursiveProp = null
    if (
        isRecursiveTrackedEntityType && // Same TE Type
        !isRecursiveProgram && // Different Program
        isToProgramDefined // Defined Program
    ) {
        recursiveProp = {
            program: to.program.id,
        }
    } else if (
        isRecursiveTrackedEntityType && // Same TE Type
        !isRecursiveProgram && // Different Program
        !isToProgramDefined // Not Defined Program
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

    // Keep TEI with coords and simplify structure
    const targetInstances = normalizeInstances(
        isRecursiveTrackedEntityType & isRecursiveProgram
            ? sourceInstances
            : await fetchTEIs({
                  ...recursiveProp,
                  fields,
                  orgUnits,
                  organisationUnitSelectionMode,
              })
    )

    const targetInstanceIds = []
    // Keep TEI with relationship of correct type
    // Store Ids of target relationships
    const filteredSourceInstances = isRecursiveTrackedEntityType
        ? sourceInstances.filter((instance) =>
              isIndexInstance(instance, relationshipType.id, targetInstanceIds)
          )
        : sourceInstances

    const relationshipsById = {}
    // Create relationship objects
    filteredSourceInstances.forEach((instance) =>
        getInstanceRelationships(
            relationshipsById,
            instance,
            targetInstances,
            relationshipType.id,
            isRecursiveTrackedEntityType
        )
    )

    // Keep only instances that are the target of a relationship
    const filteredTargetInstances = Object.values(targetInstances).filter(
        (instance) => targetInstanceIds.includes(instance.id)
    )

    return {
        primary: filteredSourceInstances,
        relationships: Object.values(relationshipsById),
        secondary: filteredTargetInstances,
    }
}
