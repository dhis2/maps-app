import * as types from '../constants/actionTypes';
import { changeCoordinate } from '../util/orgUnit';

// Load organisation unit tree
export const loadOrgUnitTree = () => ({
    type: types.ORGANISATION_UNIT_TREE_LOAD,
});

// setorganisation unit tree
export const setOrgUnitTree = (rootModel) => ({
    type: types.ORGANISATION_UNIT_TREE_SET,
    payload: rootModel,
});

// Load all organisation unit groups sets
export const loadOrgUnitLevels = () => ({
    type: types.ORGANISATION_UNIT_LEVELS_LOAD,
});

// Set all organisation unit groups sets
export const setOrgUnitLevels = (data) => ({
    type: types.ORGANISATION_UNIT_LEVELS_SET,
    payload: data,
});

// Load all organisation unit groups sets
export const loadOrgUnitGroups = () => ({
    type: types.ORGANISATION_UNIT_GROUPS_LOAD,
});

// Set all organisation unit groups sets
export const setOrgUnitGroups = (data) => ({
    type: types.ORGANISATION_UNIT_GROUPS_SET,
    payload: data,
});

// Load all organisation unit groups sets
export const loadOrgUnitGroupSets = () => ({
    type: types.ORGANISATION_UNIT_GROUP_SETS_LOAD,
});

// Set all organisation unit groups sets
export const setOrgUnitGroupSets = (data) => ({
    type: types.ORGANISATION_UNIT_GROUP_SETS_SET,
    payload: data,
});

export const openOrgUnit = (attr) => ({
    type: types.ORGANISATION_UNIT_OPEN,
    payload: attr,
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

export const setOrgUnitsFilter = (layerId, fieldId, filter) => ({
    type: types.ORGANISATION_UNITS_FILTER_SET,
    layerId,
    fieldId,
    filter,
});

export const clearOrgUnitsFilter = (layerId, fieldId) => ({
    type: types.ORGANISATION_UNITS_FILTER_CLEAR,
    layerId,
    fieldId,
});

export const startRelocateOrgUnit = (layerId, feature) => ({
    type: types.ORGANISATION_UNIT_RELOCATE_START,
    layerId,
    feature,
});

export const stopRelocateOrgUnit = (layerId, feature) => ({
    type: types.ORGANISATION_UNIT_RELOCATE_STOP,
    layerId,
    feature,
});

export const changeOrgUnitCoordinate = (layerId, featureId, coordinate) => (dispatch) => {
    changeCoordinate(featureId, coordinate)
        .then(response => {
            if (response.ok) {
                // Update org. unit in redux store
                dispatch({
                    type: types.ORGANISATION_UNIT_COORDINATE_CHANGE,
                    layerId,
                    featureId,
                    coordinate,
                });
            }
        })
        .catch(err => console.log('Error:', err)); // TODO
};





