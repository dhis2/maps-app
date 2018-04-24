import * as types from '../constants/actionTypes';

const defaultState = {
    isExpanded: true,
    isSharingDialogOpen: false,
    isDetailsDialogOpen: false,
};

const details = (state = defaultState, action) => {
    switch (action.type) {
        case types.DETAILS_TOGGLE_EXPAND:
            return { ...state, isExpanded: !state.isExpanded };

        case types.DETAILS_SHARING_DIALOG_OPEN:
            return { ...state, isSharingDialogOpen: true };

        case types.DETAILS_SHARING_DIALOG_CLOSE:
            return { ...state, isSharingDialogOpen: false };

        case types.DETAILS_DIALOG_OPEN:
            return { ...state, isDetailsDialogOpen: true };

        case types.DETAILS_DIALOG_CLOSE:
            return { ...state, isDetailsDialogOpen: false} ;

        default:
            return state;
    }
};

export default details;