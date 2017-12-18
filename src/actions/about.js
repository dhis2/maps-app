import * as types from '../constants/actionTypes';

export const openAboutDialog = () => ({
    type: types.ABOUT_DIALOG_OPEN_REQUESTED,
});

export const closeAboutDialog = () => ({
    type: types.ABOUT_DIALOG_CLOSE_REQUESTED,
});
