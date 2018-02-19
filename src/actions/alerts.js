import * as types from '../constants/actionTypes';

export const setAlert = () => ({
    type: types.ALERT_SET,
});

export const clearAlerts = () => ({
    type: types.ALERTS_CLEAR,
});
