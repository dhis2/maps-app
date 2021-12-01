import * as types from '../constants/actionTypes';

const userSettings = (state = {}, { type, payload }) => {
    switch (type) {
        case types.USER_SETTINGS_SET:
            return {
                ...state,
                user: payload,
            };

        default:
            return state;
    }
};

export default userSettings;
