import * as types from '../constants/actionTypes.js'

export const highlightFeature = (payload) => ({
    type: types.FEATURE_HIGHLIGHT,
    payload,
})

export const setFeatureProfile = (payload) => ({
    type: types.FEATURE_PROFILE_SET,
    payload,
})

export const closeFeatureProfile = () => ({
    type: types.FEATURE_PROFILE_CLOSE,
})
