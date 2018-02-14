import * as types from '../constants/actionTypes';

const message = (state = null, action) => {
    switch (action.type) {

        case types.MESSAGE_SET:
            return action.payload;

        case types.MESSAGE_CLEAR:
            return null;

        default:
            return state;

    }
};

export default message;
