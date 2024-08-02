import * as types from '../constants/actionTypes.js'

const layerSourcesReducer = (state = [], action) => {
    switch (action.type) {
        case types.LAYER_SOURCES_INIT:
            return action.payload
        case types.LAYER_SOURCE_ADD:
            return [...state, action.payload]
        case types.LAYER_SOURCE_REMOVE:
            return state.filter((item) => item !== action.payload)

        default:
            return state
    }
}

export default layerSourcesReducer
