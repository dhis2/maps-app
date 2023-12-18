import * as types from '../constants/actionTypes.js'

export const setInterpretation = (id) => ({
    type: types.INTERPRETATION_SET,
    payload: id,
})
