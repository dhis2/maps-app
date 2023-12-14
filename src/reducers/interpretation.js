import * as types from '../constants/actionTypes.js'

const interpretation = (state = {}, action) => {
    switch (action.type) {
        case types.INTERPRETATION_SET:
            return action.payload

        default:
            return state
    }
}

export default interpretation
