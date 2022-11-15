import * as types from '../constants/actionTypes';

const alerts = (state = [], action) => {
    switch (action.type) {
        case types.ALERT_SET: {
            if (state.find(alert => alert.message === action.payload.message)) {
                return state;
            }
            return [...state, action.payload];
        }

        case types.ALERTS_CLEAR:
            return [];

        default:
            return state;
    }
};

export default alerts;
