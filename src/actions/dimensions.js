import * as types from '../constants/actionTypes';

// Load all dimensions
export const loadDimensions = () => ({
    type: types.DIMENSIONS_LOAD,
});

// Set all dimensions
export const setDimensions = data => ({
    type: types.DIMENSIONS_SET,
    payload: data,
});
