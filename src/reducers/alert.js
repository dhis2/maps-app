import * as types from '../constants/actionTypes';

const alert = (state = null, action) => {
    switch (action.type) {
        case types.ALERT_SET:
            return action.payload;

        case types.ALERTS_CLEAR:
            return null;

        default:
            return state;
    }
};

export default alert;
