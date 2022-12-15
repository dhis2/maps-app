import * as types from '../constants/actionTypes.js'

const indicatorGroups = (state = null, action) => {
    switch (action.type) {
        case types.INDICATOR_GROUPS_SET:
            return action.payload

        default:
            return state
    }
}

export default indicatorGroups
