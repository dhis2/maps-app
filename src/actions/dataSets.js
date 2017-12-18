import * as types from '../constants/actionTypes';

// Load all programs
export const loadDataSets = () => ({
    type: types.DATA_SETS_LOAD,
});

// Set all programs
export const setDataSets = (data) => ({
    type: types.DATA_SETS_SET,
    payload: data,
});

