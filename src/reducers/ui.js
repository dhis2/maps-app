import * as types from '../constants/actionTypes.js'

const defaultState = {
    width: typeof window === 'object' ? window.innerWidth : null,
    height: typeof window === 'object' ? window.innerHeight : null,
    layersPanelOpen: true,
    rightPanelOpen: false,
    dataTableHeight: 300,
    mapContextMenu: true,
}

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case types.LAYERS_PANEL_OPEN:
            return {
                ...state,
                layersPanelOpen: true,
            }

        case types.LAYERS_PANEL_CLOSE:
            return {
                ...state,
                layersPanelOpen: false,
            }

        case types.INTERPRETATIONS_PANEL_OPEN:
        case types.ORGANISATION_UNIT_PROFILE_SET:
            return {
                ...state,
                rightPanelOpen: true,
            }

        case types.INTERPRETATIONS_PANEL_CLOSE:
        case types.ORGANISATION_UNIT_PROFILE_CLOSE:
        case types.DOWNLOAD_MODE_TOGGLE:
        case types.MAP_NEW:
        case types.MAP_SET:
            return {
                ...state,
                rightPanelOpen: false,
            }

        case types.DATA_TABLE_RESIZE:
            return {
                ...state,
                dataTableHeight: action.height,
            }

        default:
            return state
    }
}

export default ui
