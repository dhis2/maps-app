import * as types from '../constants/actionTypes';

const defaultState = {
    width: typeof window === 'object' ? window.innerWidth : null,
    height: typeof window === 'object' ? window.innerHeight : null,
    layersPanelOpen: true,
    dataTableOpen: false,
    dataTableHeight: 300,
    layersDialogOpen: false,
    favoritesDialogOpen: false,
    saveFavoriteDialogOpen: false,
    aboutDialogOpen: false,
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

        case types.FAVORITES_DIALOG_OPEN:
            return {
                ...state,
                favoritesDialogOpen: true,
            };

        case types.FAVORITES_DIALOG_CLOSE:
            return {
                ...state,
                favoritesDialogOpen: false,
            };

        case types.FAVORITE_SAVE_DIALOG_OPEN:
            return {
                ...state,
                saveFavoriteDialogOpen: true,
            };

        case types.FAVORITE_SAVE_DIALOG_CLOSE:
            return {
                ...state,
                saveFavoriteDialogOpen: false,
            };

        case types.ABOUT_DIALOG_OPEN:
            return {
                ...state,
                aboutDialogOpen: true,
            };

        case types.ABOUT_DIALOG_CLOSE:
            return {
                ...state,
                aboutDialogOpen: false,
            };

        default:
            return state

    }
};

export default ui;
