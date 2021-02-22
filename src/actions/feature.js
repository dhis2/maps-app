import * as types from '../constants/actionTypes';

export const highlightFeature = payload => ({
    type: types.FEATURE_HIGHLIGHT,
    payload,
});
