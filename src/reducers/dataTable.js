import * as types from '../constants/actionTypes';

const defaultState = {
    id: null,
    data: null,
};

const dataTable = (state = defaultState, action) => {
    switch (action.type) {
        case types.DATA_TABLE_OPEN:
            return {
                ...state,
                id: action.id,
            };

        case types.DATA_TABLE_CLOSE:
        case types.MAP_NEW:
        case types.FAVORITE_LOAD:
            return defaultState;

        case types.DATA_TABLE_TOGGLE:
            return {
                ...state,
                id: state.id === action.id ? null : action.id,
            };

        case types.LAYER_REMOVE:
            return state === action.id ? defaultState : state;

        default:
            return state;
    }
};

export default dataTable;
