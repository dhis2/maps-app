import * as types from '../constants/actionTypes.js'

const layerTypesReducer = (state = [], action) => {
    switch (action.type) {
        case types.LAYER_TYPES_INIT:
            return action.payload
        case types.LAYER_TYPES_SHOW:
            return [...state, action.payload]
        case types.LAYER_TYPES_HIDE:
            return state.filter((item) => item !== action.payload)

        default:
            return state
    }
}

export default layerTypesReducer
