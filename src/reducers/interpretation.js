import * as types from '../constants/actionTypes';

const interpretation = (state = {}, action) => {
    switch (action.type) {
        case types.INTERPRETATION_SET:
            return { ...state, id: action.payload };

        default:
            return state;
    }
};

export default interpretation;
