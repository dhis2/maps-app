import * as types from '../constants/actionTypes.js'

const dataSets = (state = null, action) => {
    switch (action.type) {
        case types.DATA_SETS_SET:
            return action.payload

        default:
            return state
    }
}

export default dataSets
