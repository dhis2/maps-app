import * as types from '../constants/actionTypes';

const orgUnitGroupSets = (state = null, action) => {
    switch (action.type) {
        case types.ORGANISATION_UNIT_GROUP_SETS_SET:
            return action.payload;

        default:
            return state;
    }
};

export default orgUnitGroupSets;
