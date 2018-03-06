import * as types from '../constants/actionTypes';

const orgUnitTree = (state = null, action) => {
    switch (action.type) {
        case types.ORGANISATION_UNIT_TREE_SET:
            return action.payload;

        default:
            return state;
    }
};

export default orgUnitTree;
