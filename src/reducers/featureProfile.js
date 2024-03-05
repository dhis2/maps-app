import * as types from '../constants/actionTypes.js'

const featureProfile = (state = null, action) => {
    switch (action.type) {
        case types.FEATURE_PROFILE_SET:
            return action.payload

        case types.FEATURE_PROFILE_CLOSE:
        case types.ORGANISATION_UNIT_PROFILE_SET:
        case types.INTERPRETATIONS_PANEL_OPEN:
        case types.MAP_NEW:
        case types.MAP_SET:
            return null

        default:
            return state
    }
}

export default featureProfile
