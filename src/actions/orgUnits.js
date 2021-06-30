import * as types from '../constants/actionTypes';

// Load organisation unit tree
export const loadOrgUnitTree = () => ({
    type: types.ORGANISATION_UNIT_TREE_LOAD,
});

// set organisation unit tree
export const setOrgUnitTree = rootModel => ({
    type: types.ORGANISATION_UNIT_TREE_SET,
    payload: rootModel,
});

// Load all organisation unit groups sets
export const loadOrgUnitLevels = () => ({
    type: types.ORGANISATION_UNIT_LEVELS_LOAD,
});

// Set all organisation unit groups sets
export const setOrgUnitLevels = data => ({
    type: types.ORGANISATION_UNIT_LEVELS_SET,
    payload: data,
});

// Load all organisation unit groups sets
export const loadOrgUnitGroups = () => ({
    type: types.ORGANISATION_UNIT_GROUPS_LOAD,
});

// Set all organisation unit groups sets
export const setOrgUnitGroups = data => ({
    type: types.ORGANISATION_UNIT_GROUPS_SET,
    payload: data,
});

// Load all organisation unit groups sets
export const loadOrgUnitGroupSets = () => ({
    type: types.ORGANISATION_UNIT_GROUP_SETS_LOAD,
});

// Set all organisation unit groups sets
export const setOrgUnitGroupSets = data => ({
    type: types.ORGANISATION_UNIT_GROUP_SETS_SET,
    payload: data,
});

export const setOrgUnit = id => ({
    type: types.ORGANISATION_UNIT_SET,
    payload: id,
});

export const closeOrgUnit = () => ({
    type: types.ORGANISATION_UNIT_CLOSE,
});

export const selectOrgUnit = (layerId, featureId) => ({
    type: types.ORGANISATION_UNIT_SELECT,
    layerId,
    featureId,
});

export const unselectOrgUnit = (layerId, featureId) => ({
    type: types.ORGANISATION_UNIT_UNSELECT,
    layerId,
    featureId,
});

export const changeOrgUnitCoordinate = (layerId, featureId, coordinate) => ({
    type: types.ORGANISATION_UNIT_COORDINATE_CHANGE,
    layerId,
    featureId,
    coordinate,
});

export const setOrgUnitCoordinate = (layerId, featureId, coordinate) => ({
    type: types.ORGANISATION_UNIT_COORDINATE_SET,
    layerId,
    featureId,
    coordinate,
});
