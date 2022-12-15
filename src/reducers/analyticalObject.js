import * as types from '../constants/actionTypes.js'

const analyticalObject = (state = null, action) => {
    switch (action.type) {
        case types.ANALYTICAL_OBJECT_SET:
            return action.payload

        case types.ANALYTICAL_OBJECT_CLEAR:
            return null

        default:
            return state
    }
}

export default analyticalObject
