import { defaultBasemaps } from '../constants/basemaps';
import { BING_LAYER } from '../constants/layers';

import * as types from '../constants/actionTypes';

const basemaps = (state = defaultBasemaps(), action) => {
    let bingMapsKey;

    switch (action.type) {
        case types.BASEMAP_ADD:
            return [...state, action.payload];

        case types.BASEMAP_REMOVE:
            return state.filter(basemap => basemap.id !== action.id);

        case types.BASEMAP_REMOVE_BING_MAPS:
            return state.filter(layer => layer.config.type !== BING_LAYER);

        case types.BASEMAP_BING_KEY_SET:
            return state.map(layer => {
                if (layer.config.type !== BING_LAYER) {
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
