import * as types from '../constants/actionTypes.js'

const programIndicators = (state = {}, action) => {
    switch (action.type) {
        case types.PROGRAM_INDICATORS_SET:
            return {
                ...state,
                [action.programId]: action.payload,
            }

        default:
            return state
    }
}

export default programIndicators
