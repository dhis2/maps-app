import * as types from '../constants/actionTypes';

const orgUnit = (state = null, action) => {
    switch (action.type) {

        case types.ORGANISATION_UNIT_OPEN:
            return {
                ...action.payload,
            };

        case types.ORGANISATION_UNIT_CLOSE:
            return null;

        default:
            return state;

    }
};

export default orgUnit;

