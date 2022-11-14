import * as types from '../constants/actionTypes';

export const highlightFeature = payload => ({
    type: types.FEATURE_HIGHLIGHT,
    payload,
});

export const setFeatureProfile = properties => ({
    type: types.FEATURE_PROFILE_SET,
    payload: properties,
});

export const closeFeatureProfile = () => ({
    type: types.FEATURE_PROFILE_CLOSE,
});
