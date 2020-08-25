import { apiFetch } from './api';

const TRACKED_ENTITY_INSTANCE = 'TRACKED_ENTITY_INSTANCE';

export const fetchTEIs = async ({
    type,
    orgUnits,
    fields,
    organisationUnitSelectionMode,
    targetIds,
}) => {
    let url = `/trackedEntityInstances?skipPaging=true&fields=${fields}&ou=${orgUnits}`;
    if (organisationUnitSelectionMode) {
        url += `&ouMode=${organisationUnitSelectionMode}`;
    }

    url += `&trackedEntityType=${type.id}`;

    const { trackedEntityInstances } = await apiFetch(url);

    return targetIds
        ? trackedEntityInstances.filter(instance =>
              targetIds.includes(instance.id)
          )
        : trackedEntityInstances;
};

const normalizeInstances = instances => {
    return instances
        .filter(instance => !!instance.coordinates)
        .reduce((out, instance) => {
            out[instance.id] = instance;
            return out;
        }, {});
};

export const parseTEInstanceId = instance =>
    instance.trackedEntityInstance.trackedEntityInstance;

const isValidRel = (rel, type, id) =>
    rel.relationshipType === type && parseTEInstanceId(rel.from) === id;

const isIndexInstance = (instance, type) => {
    let hasChildren = false;
    for (let i = 0; i < instance.relationships.length; ++i) {
        const rel = instance.relationships[i];
        if (rel.relationshipType !== type) {
            continue;
        }
        if (parseTEInstanceId(rel.to) === instance.id) {
            return false;
        }
        if (parseTEInstanceId(rel.from) === instance.id) {
            hasChildren = true;
        }
    }
    return hasChildren;
};

const getTargetInstances = sourceInstances =>
    sourceInstances.reduce(
        (ids, instance) => [
            ...ids,
            ...instance.relationships.map(rel => parseTEInstanceId(rel.to)),
        ],
        []
    );

const getInstanceRelationships = (
    relationshipsById,
    from,
    targetInstances,
    type,
    isRecursive
) => {
    const localRels = from.relationships.filter(rel =>
        isValidRel(rel, type, from.id)
    );

    localRels.forEach(rel => {
        const id = rel.relationship;
        if (relationshipsById[id]) return;
        const to = targetInstances[parseTEInstanceId(rel.to)];
        if (!to) {
            // console.error('NOT FOUND', rel.to);
            return;
        }
        relationshipsById[id] = {
            id,
            from,
            to,
        };
        if (isRecursive) {
            getInstanceRelationships(
                relationshipsById,
                to,
                targetInstances,
                type,
                true
            );
        }
    });
};

const fields = [
    'trackedEntityInstance~rename(id)',
    'featureType',
    'coordinates',
    'relationships',
];
export const getDataWithRelationships = async (
    sourceInstances,
    relationshipType,
    relationshipOutsideProgram,
    { orgUnits, organisationUnitSelectionMode }
) => {
    const from = relationshipType.fromConstraint;
    const to = relationshipType.toConstraint;

    if (
        from.relationshipEntity !== TRACKED_ENTITY_INSTANCE ||
        to.relationshipEntity !== TRACKED_ENTITY_INSTANCE
    ) {
        return [];
    }

    const isRecursive = from.trackedEntityType.id === to.trackedEntityType.id;

    const filteredSourceInstances = isRecursive
        ? sourceInstances.filter(instance =>
              isIndexInstance(instance, relationshipType.id)
          )
        : sourceInstances;

    const targetInstances = normalizeInstances(
        isRecursive && !relationshipOutsideProgram
            ? sourceInstances
            : await fetchTEIs({
                  type: to.trackedEntityType,
                  fields,
                  orgUnits,
                  organisationUnitSelectionMode,
                  targetIds:
                      relationshipOutsideProgram &&
                      getTargetInstances(filteredSourceInstances),
              })
    );

    const relationshipsById = {};
    filteredSourceInstances.forEach(instance =>
        getInstanceRelationships(
            relationshipsById,
            instance,
            targetInstances,
            relationshipType.id,
            isRecursive
        )
    );

    filteredSourceInstances.forEach(instance => {
        delete targetInstances[instance.id];
    });
    return {
        primary: filteredSourceInstances,
        relationships: Object.values(relationshipsById),
        secondary: Object.values(targetInstances),
    };
};
