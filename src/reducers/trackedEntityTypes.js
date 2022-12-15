import * as types from '../constants/actionTypes.js'

const trackedEntityTypes = (state = null, action) => {
    switch (action.type) {
        case types.TRACKED_ENTITY_TYPES_SET:
            return action.payload

        default:
            return state
    }
}

export default trackedEntityTypes
