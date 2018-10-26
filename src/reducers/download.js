import * as types from '../constants/actionTypes';

const defaultState = {
    isActive: false,
    showLegend: true,
    legendPosition: 'bottom-right',
};

const download = (state = defaultState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_STATE_SET:
            return {
                ...state,
                isActive: action.payload,
            };

        case types.DOWNLOAD_LEGEND_STATE_SET:
            return {
                ...state,
                showLegend: action.payload,
            };

        case types.DOWNLOAD_LEGEND_POSITION_SET:
            return {
                ...state,
                legendPosition: action.payload,
            };

        default:
            return state;
    }
};

export default download;
