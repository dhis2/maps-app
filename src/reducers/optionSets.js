import * as types from '../constants/actionTypes.js'

const optionSets = (state = {}, action) => {
    switch (action.type) {
        case types.OPTION_SET_ADD:
            return {
                ...state,
                [action.payload.id]: action.payload,
            }

        default:
            return state
    }
}

export default optionSets
