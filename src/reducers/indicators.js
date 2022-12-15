import * as types from '../constants/actionTypes.js'

const indicators = (state = {}, action) => {
    switch (action.type) {
        case types.INDICATORS_SET:
            return {
                ...state,
                [action.groupId]: action.payload,
            }

        default:
            return state
    }
}

export default indicators
