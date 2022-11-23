import * as types from '../constants/actionTypes.js'

const dataElementOperands = (state = {}, action) => {
    switch (action.type) {
        case types.DATA_ELEMENT_OPERANDS_SET:
            return {
                ...state,
                [action.groupId]: action.payload,
            }

        default:
            return state
    }
}

export default dataElementOperands
