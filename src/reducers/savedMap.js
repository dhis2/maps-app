import * as types from '../constants/actionTypes.js'

const savedMap = (state = null, action) => {
    switch (action.type) {
        case types.MAP_NEW:
            return null
        case types.MAP_SET:
            return action.payload
        case types.MAP_PROPS_SET:
            return state ? { ...state, ...action.payload } : state
        default:
            return state
    }
}

export default savedMap
