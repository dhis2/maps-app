import * as types from '../constants/actionTypes.js'

const programDataElements = (state = {}, action) => {
    switch (action.type) {
        // Set data elements for program
        case types.PROGRAM_DATA_ELEMENTS_SET:
            return {
                ...state,
                [action.programId]: action.payload,
            }

        default:
            return state
    }
}

export default programDataElements
