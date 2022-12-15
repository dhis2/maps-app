import * as types from '../constants/actionTypes.js'

// Load all legend sets
export const loadLegendSets = () => ({
    type: types.LEGEND_SETS_LOAD,
})

// Set all legend sets
export const setLegendSets = (data) => ({
    type: types.LEGEND_SETS_SET,
    payload: data,
})
