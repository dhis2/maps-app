import * as types from '../constants/actionTypes';

const defaultState = {
    system: {
        keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
    },
    user: {},
};

const userSettings = (state = defaultState, action) => {
    switch (action.type) {
        case types.SYSTEM_SETTINGS_SET:
            return {
                ...state,
                system: action.payload,
            };

        case types.USER_SETTINGS_SET:
            return {
                ...state,
                user: action.payload,
            };

        default:
            return state;
    }
};

export default userSettings;
