import { defaultBasemaps } from '../constants/basemaps';

import * as types from '../constants/actionTypes';

const basemaps = (state = defaultBasemaps(), action) => {
    switch (action.type) {
        case types.BASEMAP_ADD:
            return [...state, action.payload];

        case types.BASEMAP_REMOVE:
            return state.filter(basemap => basemap.id !== action.id);

        case types.BASEMAP_BING_KEY_SET:
            // Remove Bing basemaps is no key is provided
            if (!action.key) {
                return state.filter(layer => layer.config.type !== 'bingLayer');
            }

            // Set key property on Bing basemaps
            return state.map(layer => {
                if (layer.config.type !== 'bingLayer') {
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
