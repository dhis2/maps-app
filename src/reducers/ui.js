import * as types from '../constants/actionTypes';

const defaultState = {
    width: typeof window === 'object' ? window.innerWidth : null,
    height: typeof window === 'object' ? window.innerHeight : null,
    layersPanelOpen: true,
    interpretationsPanelOpen: false,
    dataTableOpen: false,
    dataTableHeight: 300,
    layersDialogOpen: false,
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

        case types.LAYERS_DIALOG_OPEN:
            return {
                ...state,
                layersDialogOpen: true,
            };

        case types.LAYERS_DIALOG_CLOSE:
            return {
                ...state,
                layersDialogOpen: false,
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
