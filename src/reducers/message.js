import i18n from '@dhis2/d2-i18n';
import * as types from '../constants/actionTypes';

const message = (state = null, action) => {
    switch (action.type) {
        case types.MESSAGE_SET:
            return action.payload;

        case types.MESSAGE_CLEAR:
            return null;

        case types.ERROR_SET:
            if (!action.payload || !action.payload.message) {
                return i18n.t('Error');
            } else {
                return `${i18n.t('Error')}: ${action.payload.message}`;
            }

        default:
            return state;
    }
};

export default message;
