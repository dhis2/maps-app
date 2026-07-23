import * as types from '../constants/actionTypes.js'

export const toggleFeatureSelection = (id, layerId) => ({
    type: types.FEATURE_TOGGLE_SELECTION,
    id,
    layerId,
})

export const selectAllFeatures = (ids, layerId) => ({
    type: types.SELECTION_SET_ALL,
    ids,
    layerId,
})

export const selectFeatureRange = (ids, layerId) => ({
    type: types.SELECTION_ADD_RANGE,
    ids,
    layerId,
})

export const clearSelection = () => ({
    type: types.SELECTION_CLEAR,
})
