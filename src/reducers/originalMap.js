import * as types from '../constants/actionTypes.js'
import { defaultBasemapState } from './map.js'

const defaultState = {
    bounds: [
        [-18.7, -34.9],
        [50.2, 35.9],
    ],
    basemap: defaultBasemapState,
    mapViews: [],
}

const originalMap = (state = defaultState, action) => {
    switch (action.type) {
        case types.ORIGINAL_MAP_SET:
            return {
                ...defaultState,
                ...action.payload,
                basemap: {
                    ...defaultState.basemap,
                    ...action.payload.basemap,
                },
            }
        default:
            return state
    }
}

export const sGetOriginalMap = (state) => state.originalMap

export default originalMap
