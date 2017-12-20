import { defaultBasemaps } from '../constants/basemaps';

import * as types from '../constants/actionTypes';

const basemaps = (state = defaultBasemaps, action) => {

    switch (action.type) {

        case types.BASEMAP_ADD:
            return [
                ...state,
                action.payload,
            ];

        case types.BASEMAP_REMOVE:
            return state.filter(basemap => basemap.id !== action.id);

        default:
            return state

    }
};

export default basemaps;
