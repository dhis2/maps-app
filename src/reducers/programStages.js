import * as types from '../constants/actionTypes.js'

const programStages = (state = {}, action) => {
    switch (action.type) {
        case types.PROGRAM_STAGES_SET:
            return {
                ...state,
                [action.programId]: action.payload,
            }

        default:
            return state
    }
}

export default programStages
