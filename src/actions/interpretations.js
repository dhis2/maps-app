import * as types from '../constants/actionTypes.js'

export const setInterpretation = (payload) => ({
    type: types.INTERPRETATION_SET,
    payload,
})
