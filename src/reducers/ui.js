import * as types from '../constants/actionTypes';

const defaultState = {
    width: typeof window === 'object' ? window.innerWidth : null,
    height: typeof window === 'object' ? window.innerHeight : null,
    layersPanelOpen: true,
    interpretationsPanelOpen: false,
    dataTableHeight: 300,
    mapContextMenu: true,
};

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case types.SCREEN_RESIZE:
            return {
                ...state,
                width: action.width,
                height: action.height,
            };

        case types.LAYERS_PANEL_OPEN:
            return {
                ...state,
                layersPanelOpen: true,
            };

        case types.LAYERS_PANEL_CLOSE:
            return {
                ...state,
                layersPanelOpen: false,
            };

        case types.INTERPRETATIONS_PANEL_OPEN:
            return {
                ...state,
                interpretationsPanelOpen: true,
            };

        case types.INTERPRETATIONS_PANEL_CLOSE:
        case types.MAP_NEW:
            return {
                ...state,
                interpretationsPanelOpen: false,
            };

        case types.DATA_TABLE_RESIZE:
            return {
                ...state,
                dataTableHeight: action.height,
            };

        default:
            return state;
    }
};

export default ui;
