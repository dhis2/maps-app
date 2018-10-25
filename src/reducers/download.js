import * as types from '../constants/actionTypes';

const defaultState = {
    isActive: false,
    showlegend: true,
    legendPosition: 'bottom-left',
};

const download = (state = defaultState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_STATE_SET:
            return {
                ...state,
                isActive: action.payload,
            };

        default:
            return state;
    }
};

export default download;
