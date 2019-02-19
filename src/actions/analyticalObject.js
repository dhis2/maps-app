import * as types from '../constants/actionTypes';

export const getAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_GET,
});

export const setAnalyticalObject = (id, openAs) => ({
    type: types.ANALYTICAL_OBJECT_SET,
    payload: { id, openAs },
});
