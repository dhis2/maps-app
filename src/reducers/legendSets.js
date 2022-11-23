import * as types from '../constants/actionTypes.js'

const legendSets = (state = null, action) => {
    switch (action.type) {
        case types.LEGEND_SETS_SET:
            return action.payload

        default:
            return state
    }
}

export default legendSets
