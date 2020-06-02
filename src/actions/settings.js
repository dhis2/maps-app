import * as types from '../constants/actionTypes';

export const setSystemSettings = settings => ({
    type: types.SYSTEM_SETTINGS_SET,
    payload: settings,
});

// Set user settings
export const setUserSettings = settings => ({
    type: types.USER_SETTINGS_SET,
    payload: settings,
});
