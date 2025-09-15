import { arrayMoveImmutable } from 'array-move'
import * as types from '../constants/actionTypes.js'
import { generateUid } from '../util/uid.js'

export const defaultBasemapState = {
    isVisible: true,
    isExpanded: true,
    opacity: 1,
}

const defaultState = {
    bounds: [
        [-18.7, -34.9],
        [50.2, 35.9],
    ],
    basemap: defaultBasemapState,
    mapViews: [],
}

const basemap = (state, action) => {
    switch (action.type) {
        case types.BASEMAP_SELECTED:
            if (state.id === action.payload.id) {
                return state
            }

            return {
                ...state,
                ...action.payload,
            }

        case types.BASEMAP_CHANGE_OPACITY:
            return {
                ...state,
                opacity: action.opacity,
            }

        case types.BASEMAP_TOGGLE_EXPAND:
            return {
                ...state,
                isExpanded: !state.isExpanded,
            }

        case types.BASEMAP_TOGGLE_VISIBILITY:
            return {
                ...state,
                isVisible: !state.isVisible,
            }

        default:
            return state
    }
}

const layer = (state, action) => {
    let filters

    switch (action.type) {
        case types.LAYER_UPDATE:
            if (state.id !== action.payload.id) {
                return state
            }

            return {
                ...action.payload,
            }

        case types.LAYER_CHANGE_OPACITY:
            if (state.id !== action.id) {
                return state
            }

            return {
                ...state,
                opacity: action.opacity,
            }

        case types.LAYER_CHANGE_INTENSITY:
            if (state.id !== action.id) {
                return state
            }

            return {
                ...state,
                heatIntensity: action.heatIntensity,
            }

        case types.LAYER_CHANGE_RADIUS:
            if (state.id !== action.id) {
                return state
            }

            return {
                ...state,
                heatRadius: action.heatRadius,
            }

        case types.LAYER_LOADING_SET:
            if (state.id !== action.id) {
                return state
            }

            return {
                ...state,
                isLoading: true,
            }

        case types.LAYER_TOGGLE_VISIBILITY:
            if (state.id !== action.id) {
                return state
            }

            return {
                ...state,
                isVisible: !state.isVisible,
            }

        case types.LAYER_TOGGLE_EXPAND:
            if (state.id !== action.id) {
                return state
            }

            return {
                ...state,
                isExpanded: !state.isExpanded,
            }

        // Add/change filter
        case types.DATA_FILTER_SET:
            if (state.id !== action.layerId) {
                return state
            }

            return {
                ...state,
                dataFilters: {
                    ...state.dataFilters,
                    [action.fieldId]: action.filter,
                },
            }

        // Remove field from filter
        case types.DATA_FILTER_CLEAR:
            if (state.id !== action.layerId) {
                return state
            }

            filters = { ...state.dataFilters }
            delete filters[action.fieldId]

            return {
                ...state,
                dataFilters: filters,
            }

        case types.MAP_ALERTS_CLEAR:
            return {
                ...state,
                alerts: undefined,
            }

        case types.MAP_EARTH_ENGINE_VALUE_SHOW:
            if (state.id !== action.layerId) {
                return state
            }

            return {
                ...state,
                coordinate: action.coordinate,
            }

        default:
            return state
    }
}

const map = (state = defaultState, action) => {
    let mapViews
    let sortedMapViews

    switch (action.type) {
        case types.MAP_NEW:
            return {
                ...defaultState,
            }

        case types.MAP_SET:
            return {
                ...defaultState,
                ...action.payload,
                basemap: {
                    ...defaultState.basemap,
                    ...action.payload.basemap,
                },
            }

        case types.MAP_PROPS_SET:
            return {
                ...state,
                ...action.payload,
            }

        case types.MAP_COORDINATE_OPEN:
            return {
                ...state,
                coordinatePopup: action.payload,
            }

        case types.MAP_COORDINATE_CLOSE:
            return {
                ...state,
                coordinatePopup: null,
            }

        case types.BASEMAP_SELECTED:
        case types.BASEMAP_CHANGE_OPACITY:
        case types.BASEMAP_TOGGLE_EXPAND:
        case types.BASEMAP_TOGGLE_VISIBILITY:
            return {
                ...state,
                basemap: basemap(state.basemap, action),
            }

        case types.LAYER_ADD:
            // Check to only allow external layers to be added once
            if (
                state.mapViews.filter((l) => l.id === action.payload.id).length
            ) {
                return state
            }

            return {
                ...state,
                mapViews: [
                    ...state.mapViews,
                    {
                        ...action.payload,
                        id: generateUid(),
                    },
                ],
            }

        case types.LAYER_REMOVE:
            return {
                ...state,
                mapViews: state.mapViews.filter(
                    (layer) => layer.id !== action.id
                ),
            }

        case types.LAYER_SORT:
            mapViews = [...state.mapViews].reverse() // TODO: Refactor
            sortedMapViews = arrayMoveImmutable(
                mapViews,
                action.oldIndex,
                action.newIndex
            ).reverse()

            return {
                ...state,
                mapViews: sortedMapViews,
            }

        case types.LAYER_UPDATE:
        case types.LAYER_EDIT:
        case types.LAYER_CHANGE_OPACITY:
        case types.LAYER_CHANGE_INTENSITY:
        case types.LAYER_CHANGE_RADIUS:
        case types.LAYER_TOGGLE_VISIBILITY:
        case types.LAYER_TOGGLE_EXPAND:
        case types.DATA_FILTER_SET:
        case types.DATA_FILTER_CLEAR:
        case types.MAP_EARTH_ENGINE_VALUE_SHOW:
            return {
                ...state,
                mapViews: state.mapViews.map((l) => layer(l, action)),
            }

        case types.LAYER_LOADING_SET: {
            return {
                ...state,
                mapViews: state.mapViews.map((l) => layer(l, action)),
            }
        }

        case types.MAP_ALERTS_CLEAR:
            return {
                ...state,
                alerts: undefined,
                mapViews: state.mapViews.map((l) => layer(l, action)),
            }

        default:
            return state
    }
}

export default map
