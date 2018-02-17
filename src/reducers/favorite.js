import * as types from '../constants/actionTypes';

const defaultState = {
    dialogOpen: false,
    saveNewDialogOpen: false,
    response: null,
};

const favorite = (state = defaultState, action) => {

    switch (action.type) {

        case types.FAVORITES_DIALOG_OPEN:
            return {
                ...state,
                dialogOpen: true,
            };

        case types.FAVORITES_DIALOG_CLOSE:
            return {
                ...state,
                dialogOpen: false,
            };

        case types.FAVORITE_SAVE_NEW_DIALOG_OPEN:
            return {
                ...state,
                saveNewDialogOpen: true,
            };

        case types.FAVORITE_SAVE_NEW_DIALOG_CLOSE:
            return {
                ...state,
                saveNewDialogOpen: false,
                response: null,
            };

        case types.FAVORITE_SAVE_NEW_RESPONSE_SET:
            return {
                ...state,
                response: action.response,
            };

        default:
            return state;

    }
};

export default favorite;
