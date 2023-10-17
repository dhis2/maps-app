import * as types from '../constants/actionTypes.js'

export const openDataTable = (id) => ({
    type: types.DATA_TABLE_OPEN,
    id,
})

export const closeDataTable = () => ({
    type: types.DATA_TABLE_CLOSE,
})

export const toggleDataTable = (id) => ({
    type: types.DATA_TABLE_TOGGLE,
    id,
})

export const resizeDataTable = (height) => ({
    type: types.DATA_TABLE_RESIZE,
    height,
})
