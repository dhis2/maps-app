import * as types from '../constants/actionTypes.js'

const programStageDataElements = (state = {}, action) => {
    switch (action.type) {
        // Set data elements for program stage
        case types.PROGRAM_STAGE_DATA_ELEMENTS_SET:
            return {
                ...state,
                [action.programStageId]: action.payload,
            }

        default:
            return state
    }
}

export default programStageDataElements
