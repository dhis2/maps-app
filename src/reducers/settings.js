import * as types from '../constants/actionTypes';

const periodSetting = /keyHide(.*)Periods/;

const userSettings = (state = {}, { type, payload }) => {
    switch (type) {
        case types.SYSTEM_SETTINGS_SET:
            return {
                ...state,
                system: payload,
                hiddenPeriods: Object.keys(payload)
                    .filter(
                        setting =>
                            periodSetting.test(setting) && payload[setting]
                    )
                    .map(setting =>
                        setting.match(periodSetting)[1].toUpperCase()
                    ),
            };

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
