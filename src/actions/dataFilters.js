import * as types from '../constants/actionTypes.js'

export const setDataFilter = (layerId, fieldId, filter) => ({
    type: types.DATA_FILTER_SET,
    layerId,
    fieldId,
    filter,
})

export const clearDataFilter = (layerId, fieldId) => ({
    type: types.DATA_FILTER_CLEAR,
    layerId,
    fieldId,
})
