import * as types from '../constants/actionTypes.js'

export const setAggregations = (payload) => ({
    type: types.AGGREGATIONS_SET,
    payload,
})
