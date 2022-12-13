import * as types from '../constants/actionTypes.js'

const programTrackedEntityAttributes = (state = {}, action) => {
    switch (action.type) {
        // Set attributes for program
        case types.PROGRAM_ATTRIBUTES_SET:
            return {
                ...state,
                [action.programId]: action.payload,
            }

        default:
            return state
    }
}

export default programTrackedEntityAttributes
