import * as types from '../constants/actionTypes.js'

const alerts = (state = [], action) => {
    switch (action.type) {
        case types.ALERT_SET:
            return [...state, action.payload]

        case types.ALERTS_CLEAR:
            return []

        default:
            return state
    }
}

export default alerts
