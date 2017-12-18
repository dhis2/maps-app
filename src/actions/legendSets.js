import * as types from '../constants/actionTypes';

// Load all programs
export const loadLegendSets = () => ({
    type: types.LEGEND_SETS_LOAD,
});

// Set all programs
export const setLegendSets = (data) => ({
    type: types.LEGEND_SETS_SET,
    payload: data,
});

