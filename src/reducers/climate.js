import * as types from '../constants/actionTypes.js'

const climate = (state = null, action) => {
    switch (action.type) {
        case types.CLIMATE_PANEL_OPEN:
            return { ...action.payload }

        case types.CLIMATE_PANEL_CLOSE:
            return null

        default:
            return state
    }
}

export default climate
