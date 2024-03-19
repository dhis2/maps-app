import * as types from '../constants/actionTypes.js'

export const setAnalyticalObject = (ao) => ({
    type: types.ANALYTICAL_OBJECT_SET,
    payload: ao,
})

export const clearAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_CLEAR,
})
