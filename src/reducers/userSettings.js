import * as types from '../constants/actionTypes';

const userSettings = (state = null, action) => {
    switch (action.type) {
        case types.USER_SETTINGS_SET:
            return action.payload;

        default:
            return state;
    }
};

export default userSettings;
