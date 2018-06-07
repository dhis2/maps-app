import * as types from '../constants/actionTypes';

export const setInterpretation = id => ({
    type: types.INTERPRETATION_SET,
    payload: id,
});
