import * as types from '../constants/actionTypes';

const dataTable = (state = {}, action) => {
    let layerId;

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
        case types.LAYER_UPDATE:
            layerId = action.id || action.payload?.id;

            return layerId && state[layerId]
                ? {
                      ...state,
                      [layerId]: undefined,
                  }
                : state;

        default:
            return state;
    }
};

export default dataTable;
