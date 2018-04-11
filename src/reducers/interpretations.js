import * as types from '../constants/actionTypes';
import _ from 'lodash';

const defaultState = {
    isExpanded: true,
    isWriteInterpretationDialogOpen: false,
    interpretationToEdit: null,
    interpretations: [],
    currentInterpretationId: null,
};

const interpretations = (state = defaultState, action) => {
    switch (action.type) {
        case types.INTERPRETATIONS_TOGGLE_EXPAND:
            return { ...state, isExpanded: !state.isExpanded };

        case types.INTERPRETATIONS_OPEN_WRITE_DIALOG:
            return { ...state, interpretationToEdit: action.interpretation };

        case types.INTERPRETATIONS_CLOSE_WRITE_DIALOG:
            return { ...state, interpretationToEdit: null };

        case types.INTERPRETATIONS_SET:
            return { ...state, interpretations: action.interpretations };

        case types.INTERPRETATIONS_SET_CURRENT:
            return { ...state, currentInterpretationId: action.interpretationId };

        default:
            return state;
    }
};

export default interpretations;
