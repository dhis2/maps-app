import * as types from '../constants/actionTypes.js'

export const addOptionSet = (data) => ({
    type: types.OPTION_SET_ADD,
    payload: data,
})

// Load all stages for one program
export const loadOptionSet = (id) => ({
    type: types.OPTION_SET_LOAD,
    id,
})
