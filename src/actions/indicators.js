import * as types from '../constants/actionTypes.js'

export const setIndicators = (groupId, data) => ({
    type: types.INDICATORS_SET,
    groupId,
    payload: data,
})

export const loadIndicators = (groupId) => ({
    type: types.INDICATORS_LOAD,
    groupId,
})
