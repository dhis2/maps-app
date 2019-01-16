import * as types from '../constants/actionTypes';

const dimensions = (state = null, action) => {
    switch (action.type) {
        case types.DIMENSIONS_SET:
            return action.payload;

        default:
            return state;
    }
};

export default dimensions;
