import * as types from '../constants/actionTypes';

// Set user settings
export const setUserSettings = (settings) => ({
    type: types.USER_SETTINGS_SET,
    payload: settings,
});
