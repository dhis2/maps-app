import * as types from '../constants/actionTypes';

export const setAggregations = payload => ({
    type: types.AGGREGATIONS_SET,
    payload,
});
