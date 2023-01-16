import * as types from '../constants/actionTypes.js'

// Load data element operands in one group
export const loadDataElementOperands = (groupId) => ({
    type: types.DATA_ELEMENT_OPERANDS_LOAD,
    groupId,
})

// Set data element operands for one group
export const setDataElementOperands = (groupId, payload) => ({
    type: types.DATA_ELEMENT_OPERANDS_SET,
    groupId,
    payload,
})
