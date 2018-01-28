import * as types from '../constants/actionTypes';

const defaultState = {
    dialogOpen: false,
    saveDialogOpen: false,
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

        case types.FAVORITE_SAVE_DIALOG_OPEN:
            return {
                ...state,
                saveDialogOpen: true,
            };

        case types.FAVORITE_SAVE_DIALOG_CLOSE:
            return {
                ...state,
                saveDialogOpen: false,
                response: null,
            };

        case types.FAVORITE_SAVE_RESPONSE_SET:
            return {
                ...state,
                response: action.response,
            };

        default:
            return state;

    }
};

export default favorite;
