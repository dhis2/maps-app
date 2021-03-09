import * as types from '../constants/actionTypes';

const dataTable = (state = {}, action) => {
    switch (action.type) {
        case types.AGGREGATIONS_SET:
            return {
                ...state,
                ...action.payload,
            };

        case types.MAP_NEW:
        case types.FAVORITE_LOAD:
            return {};

        default:
            return state;
    }
};

export default dataTable;
