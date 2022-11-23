import * as types from '../constants/actionTypes.js'

export const setAlert = (payload) => ({
    type: types.ALERT_SET,
    payload,
})

export const clearAlerts = () => ({
    type: types.ALERTS_CLEAR,
})
