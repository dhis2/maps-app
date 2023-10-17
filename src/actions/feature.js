import * as types from '../constants/actionTypes.js'

export const highlightFeature = (payload) => ({
    type: types.FEATURE_HIGHLIGHT,
    payload,
})
