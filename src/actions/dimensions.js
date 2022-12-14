import * as types from '../constants/actionTypes.js'

// Load all dimensions
export const loadDimensions = () => ({
    type: types.DIMENSIONS_LOAD,
})

// Set all dimensions
export const setDimensions = (dimensions) => ({
    type: types.DIMENSIONS_SET,
    payload: dimensions,
})

// Load all dimension items
export const loadDimensionItems = (dimensionId) => ({
    type: types.DIMENSION_ITEMS_LOAD,
    dimensionId,
})

// Set all dimension items
export const setDimensionItems = (dimensionId, items) => ({
    type: types.DIMENSION_ITEMS_SET,
    dimensionId,
    payload: items,
})
