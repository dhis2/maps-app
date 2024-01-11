import * as types from '../constants/actionTypes.js'

const loadError = (state = null, action) => {
    switch (action.type) {
        case types.SET_LOAD_ERROR:
            return action.error

        case types.CLEAR_LOAD_ERROR:
            return null

        default:
            return state
    }
}

export default loadError
