import * as types from '../constants/actionTypes';

const orgUnitLevels = (state = null, action) => {
    switch (action.type) {
        case types.ORGANISATION_UNIT_LEVELS_SET:
            return action.payload;

        default:
            return state;
    }
};

export default orgUnitLevels;
