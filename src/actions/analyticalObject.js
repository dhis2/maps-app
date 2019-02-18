import * as types from '../constants/actionTypes';

export const getAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_GET,
});

export const openAsChart = () => ({
    type: types.ANALYTICAL_OBJECT_AS_CHART,
});
