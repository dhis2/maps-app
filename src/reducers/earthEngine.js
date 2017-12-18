import * as types from '../constants/actionTypes';

const earthEngine = (state = {}, action) => {

    switch (action.type) {
        case types.EARTH_ENGINE_COLLECTION_SET:
            return {
                ...state,
                [action.id]: action.payload
            };

    default:
        return state;

  }
};

export default earthEngine;
