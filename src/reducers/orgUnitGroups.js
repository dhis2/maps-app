import * as types from '../constants/actionTypes';

const orgUnitGroups = (state = null, action) => {
    switch (action.type) {
        case types.ORGANISATION_UNIT_GROUPS_SET:
            return action.payload;

        default:
            return state;
    }
};

export default orgUnitGroups;
