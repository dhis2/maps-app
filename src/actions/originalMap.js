import * as types from '../constants/actionTypes.js'

export const setOriginalMap = (config) => ({
    type: types.ORIGINAL_MAP_SET,
    payload: config,
})
