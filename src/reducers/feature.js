import * as types from '../constants/actionTypes';

const feature = (state = null, action) => {
    switch (action.type) {
        case types.FEATURE_HIGHLIGHT:
            return action.payload ? { ...action.payload } : null;

        default:
            return state;
    }
};

export default feature;
