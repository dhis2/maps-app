import * as types from '../constants/actionTypes';

const dataTable = (state = null, action) => {
    switch (action.type) {
        case types.DATA_TABLE_OPEN:
            return action.id;

        case types.DATA_TABLE_CLOSE:
        case types.MAP_NEW:
        case types.MAP_SET:
            return null;

        case types.DATA_TABLE_TOGGLE:
            return state === action.id ? null : action.id;

        case types.LAYER_REMOVE:
            return state === action.id ? null : state;

        default:
            return state;
    }
};

export default dataTable;
