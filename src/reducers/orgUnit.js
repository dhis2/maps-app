import * as types from '../constants/actionTypes';

const orgUnit = (state = null, action) => {
    switch (action.type) {
        case types.ORGANISATION_UNIT_SET:
            return action.payload;

        case types.ORGANISATION_UNIT_CLOSE:
        case types.INTERPRETATIONS_PANEL_OPEN:
        case types.MAP_NEW:
            return null;

        default:
            return state;
    }
};

export default orgUnit;
