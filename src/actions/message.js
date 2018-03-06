import * as types from '../constants/actionTypes';

// Set snackbar message
export const setMessage = message => ({
    type: types.MESSAGE_SET,
    payload: message,
});

// Set snackbar message
export const clearMessage = () => ({
    type: types.MESSAGE_CLEAR,
});
