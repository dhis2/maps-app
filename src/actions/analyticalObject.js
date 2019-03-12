import * as types from '../constants/actionTypes';

export const getAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_GET,
});

export const setAnalyticalObject = ao => ({
    type: types.ANALYTICAL_OBJECT_SET,
    payload: ao,
});

export const clearAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_CLEAR,
});
