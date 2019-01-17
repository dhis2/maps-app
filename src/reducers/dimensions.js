import * as types from '../constants/actionTypes';

const dimensions = (state = null, action) => {
    switch (action.type) {
        case types.DIMENSIONS_SET:
            return action.payload;

        case types.DIMENSION_ITEMS_SET:
            console.log('DIMENSION_ITEMS_SET', action, state);
            return state;

        default:
            return state;
    }
};

export default dimensions;
