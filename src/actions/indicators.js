import * as types from '../constants/actionTypes.js'

export const setIndicators = (groupId, data) => ({
    type: types.INDICATORS_SET,
    groupId,
    payload: data,
})

// Set all indicator groups
export const setIndicatorGroups = (data) => ({
    type: types.INDICATOR_GROUPS_SET,
    payload: data,
})

export const loadIndicators = (groupId) => ({
    type: types.INDICATORS_LOAD,
    groupId,
})

// Load all indicator groups
export const loadIndicatorGroups = () => ({
    type: types.INDICATOR_GROUPS_LOAD,
})
