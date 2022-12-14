import * as types from '../constants/actionTypes.js'
import { defaultBasemaps } from '../constants/basemaps.js'
import { BING_LAYER } from '../constants/layers.js'

const basemaps = (state = defaultBasemaps(), action) => {
    switch (action.type) {
        case types.BASEMAPS_ADD:
            return state.concat(action.payload)

        case types.BASEMAP_REMOVE:
            return state.filter((basemap) => basemap.id !== action.id)

        case types.BASEMAP_REMOVE_BING_MAPS:
            return state.filter((layer) => layer.config.type !== BING_LAYER)

        case types.BASEMAP_BING_KEY_SET:
            return state.map((layer) => {
                if (layer.config.type !== BING_LAYER) {
                    return layer
                }

                return {
                    ...layer,
                    config: {
                        ...layer.config,
                        apiKey: action.key,
                    },
                }
            })

        default:
            return state
    }
}

export default basemaps
