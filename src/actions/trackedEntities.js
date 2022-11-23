import * as types from '../constants/actionTypes.js'

// Load all tracked entity types
export const loadTrackedEntityTypes = () => ({
    type: types.TRACKED_ENTITY_TYPES_LOAD,
})

// Set all tracked entity types
export const setTrackedEntityTypes = (data) => ({
    type: types.TRACKED_ENTITY_TYPES_SET,
    payload: data,
})
