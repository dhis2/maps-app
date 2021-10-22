import { defaultBasemaps } from '../constants/basemaps';
import { BING_LAYER } from '../constants/basemaps';

import * as types from '../constants/actionTypes';

const basemaps = (state = defaultBasemaps(), action) => {
    let bingMapsKey;

    switch (action.type) {
        case types.BASEMAP_ADD:
            return [...state, action.payload];

        case types.BASEMAP_REMOVE:
            return state.filter(basemap => basemap.id !== action.id);

        case types.SYSTEM_SETTINGS_SET:
            bingMapsKey = action.payload && action.payload.keyBingMapsApiKey;

            // Remove Bing basemaps is no key is provided
            if (!bingMapsKey) {
                return state.filter(layer => layer.config.type !== BING_LAYER);
            }

            // Set key property on Bing basemaps
            return state.map(layer => {
                if (layer.config.type !== BING_LAYER) {
                    return layer;
                }

                return {
                    ...layer,
                    config: {
                        ...layer.config,
                        apiKey: bingMapsKey,
                    },
                };
            });

        default:
            return state;
    }
};

export default basemaps;
