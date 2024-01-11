import * as types from '../constants/actionTypes.js'

export const setLoadError = (error) => ({
    type: types.SET_LOAD_ERROR,
    error,
})

export const clearLoadError = () => ({
    type: types.CLEAR_LOAD_ERROR,
})
