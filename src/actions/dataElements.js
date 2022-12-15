import * as types from '../constants/actionTypes.js'

// Load all data element groups
export const loadDataElementGroups = () => ({
    type: types.DATA_ELEMENT_GROUPS_LOAD,
})

// Set all data element groups
export const setDataElementGroups = (data) => ({
    type: types.DATA_ELEMENT_GROUPS_SET,
    payload: data,
})

// Load data elements in one group
export const loadDataElements = (groupId) => ({
    type: types.DATA_ELEMENTS_LOAD,
    groupId,
})

// Set data elements for one group
export const setDataElements = (groupId, payload) => ({
    type: types.DATA_ELEMENTS_SET,
    groupId,
    payload,
})

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
