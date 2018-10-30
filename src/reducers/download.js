import * as types from '../constants/actionTypes';

const defaultState = {
    isActive: false,
    showName: true,
    showLegend: true,
    legendPosition: 'bottomright',
};

const download = (state = defaultState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_STATE_SET:
            return {
                ...state,
                isActive: action.payload,
            };

        case types.DOWNLOAD_NAME_STATE_SET:
            return {
                ...state,
                showName: action.payload,
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
