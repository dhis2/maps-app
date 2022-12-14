import * as types from '../constants/actionTypes.js'

const dataElements = (state = {}, action) => {
    switch (action.type) {
        case types.DATA_ELEMENTS_SET:
            return {
                ...state,
                [action.groupId]: action.payload,
            }

        default:
            return state
    }
}

export default dataElements
