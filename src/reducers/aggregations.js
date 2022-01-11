import * as types from '../constants/actionTypes';

const dataTable = (state = {}, action) => {
    switch (action.type) {
        case types.AGGREGATIONS_SET:
            return {
                ...state,
                ...action.payload,
            };

        case types.MAP_NEW:
        case types.MAP_SET:
            return {};

        case types.LAYER_REMOVE:
            return state[action.id]
                ? {
                      ...state,
                      [action.id]: null,
                  }
                : state;

        default:
            return state;
    }
};

export default dataTable;
