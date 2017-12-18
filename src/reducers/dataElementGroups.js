import * as types from '../constants/actionTypes';

const dataElementGroups = (state = null, action) => {

    switch (action.type) {
        case types.DATA_ELEMENT_GROUPS_SET:
            return action.payload;

        default:
            return state;

    }
};

export default dataElementGroups;
