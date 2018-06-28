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

// Show error in snackbar
export const setError = error => ({
    type: types.ERROR_SET,
    payload: error,
});
