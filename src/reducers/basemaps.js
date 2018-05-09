import { defaultBasemaps } from '../constants/basemaps';

import * as types from '../constants/actionTypes';

const basemaps = (state = defaultBasemaps, action) => {
    switch (action.type) {
        case types.BASEMAP_ADD:
            return [...state, action.payload];

        case types.BASEMAP_REMOVE:
            return state.filter(basemap => basemap.id !== action.id);

        // Set Google Maps key on Google basemaps
        case types.BASEMAP_GOOGLE_KEY_SET:
            return state.map(layer => {
                if (layer.config.type !== 'googleLayer') {
                    return layer;
                }

                return {
                    ...layer,
                    config: {
                        ...layer.config,
                        apiKey: action.key,
                    },
                };
            });

        default:
            return state;
    }
};

export default basemaps;
