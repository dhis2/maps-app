import * as types from '../constants/actionTypes.js'

const defaultState = {
    width: typeof window === 'object' ? window.innerWidth : null,
    height: typeof window === 'object' ? window.innerHeight : null,
    layersPanelOpen: true,
    rightPanelOpen: false,
    dataTableHeight: 300,
    mapContextMenu: true,
    downloadMode: false,
    layersSorting: false,
    mapBounds: null,
    showOnlyFeaturesInView: false,
    selectionFilter: [],
    highlightColor: null,
    lastClickedFeature: null,
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
        case types.FEATURE_PROFILE_SET:
            return {
                ...state,
                rightPanelOpen: true,
            }

        case types.INTERPRETATIONS_PANEL_CLOSE:
        case types.ORGANISATION_UNIT_PROFILE_CLOSE:
        case types.FEATURE_PROFILE_CLOSE:
            return {
                ...state,
                rightPanelOpen: false,
            }

        case types.MAP_NEW:
        case types.MAP_SET:
            return {
                ...state,
                rightPanelOpen: false,
                selectionFilter: [],
                lastClickedFeature: null,
            }

        case types.DATA_TABLE_CLOSE:
        case types.DATA_TABLE_TOGGLE:
            return {
                ...state,
                selectionFilter: [],
            }

        case types.DOWNLOAD_MODE_OPEN:
            return {
                ...state,
                downloadMode: true,
            }
        case types.DOWNLOAD_MODE_CLOSE:
            return {
                ...state,
                rightPanelOpen: false,
                downloadMode: false,
            }

        case types.DATA_TABLE_RESIZE:
            return {
                ...state,
                dataTableHeight: action.height,
            }

        case types.LAYERS_SORTING_START:
            return {
                ...state,
                layersSorting: true,
            }
        case types.LAYERS_SORTING_END:
            return {
                ...state,
                layersSorting: false,
            }

        case types.MAP_BOUNDS_CHANGED:
            return {
                ...state,
                mapBounds: action.bounds,
            }

        case types.TOGGLE_SHOW_ONLY_IN_VIEW:
            return {
                ...state,
                showOnlyFeaturesInView: !state.showOnlyFeaturesInView,
            }

        case types.SELECTION_FILTER_SET:
            return {
                ...state,
                selectionFilter: action.value,
            }

        case types.HIGHLIGHT_COLOR_SET:
            return {
                ...state,
                highlightColor: action.color,
            }

        case types.MAP_FEATURE_CLICKED:
            return {
                ...state,
                lastClickedFeature: action.payload,
            }

        default:
            return state
    }
}

export default ui
