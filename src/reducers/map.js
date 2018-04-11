import * as types from '../constants/actionTypes';
import { arrayMove } from 'react-sortable-hoc';
import { generateUid } from 'd2/lib/uid';

const defaultState = {
    bounds: [[-34.9, -18.7], [35.9, 50.2]],
    basemap: {
        id: 'osmLight',
        isVisible: true,
        isExpanded: true,
        opacity: 1,
        subtitle: 'Basemap',
    },
    mapViews: [],
};

const basemap = (state, action) => {
    switch (action.type) {
        case types.BASEMAP_SELECTED:
            if (state.id === action.id) {
                // No change
                return state;
            }

            return {
                ...state,
                id: action.id,
            };

        case types.BASEMAP_CHANGE_OPACITY:
            return {
                ...state,
                opacity: action.opacity,
            };

        case types.BASEMAP_TOGGLE_EXPAND:
            return {
                ...state,
                isExpanded: !state.isExpanded,
            };

        case types.BASEMAP_TOGGLE_VISIBILITY:
            return {
                ...state,
                isVisible: !state.isVisible,
            };

        default:
            return state;
    }
};

const layer = (state, action) => {
    switch (action.type) {
        case types.LAYER_UPDATE:
            if (state.id !== action.payload.id) {
                return state;
            }

            return {
                ...action.payload,
            };

        case types.LAYER_CHANGE_OPACITY:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                opacity: action.opacity,
            };

        case types.LAYER_TOGGLE_VISIBILITY:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                isVisible: !state.isVisible,
            };

        case types.LAYER_TOGGLE_EXPAND:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                isExpanded: !state.isExpanded,
            };

        case types.ORGANISATION_UNIT_SELECT:
        case types.ORGANISATION_UNIT_UNSELECT:
        case types.ORGANISATION_UNIT_COORDINATE_CHANGE:
            if (state.id !== action.layerId) {
                return state;
            }

            return {
                ...state,
                data: state.data.map(l => orgUnit(l, action)),
            };

        // Add/change filter
        case types.DATA_FILTER_SET:
            if (state.id !== action.layerId) {
                return state;
            }

            return {
                ...state,
                dataFilters: {
                    ...state.dataFilters,
                    [action.fieldId]: action.filter,
                },
                // editCounter: ++state.editCounter, // Will trigger redraw
            };

        // Remove field from filter
        case types.DATA_FILTER_CLEAR:
            if (state.id !== action.layerId) {
                return state;
            }

            const filters = { ...state.dataFilters };
            delete filters[action.fieldId];

            return {
                ...state,
                dataFilters: filters,
                // editCounter: ++state.editCounter, // Will trigger redraw
            };

        case types.ALERTS_CLEAR:
            return {
                ...state,
                alerts: null,
            };

        case types.MAP_EARTH_ENGINE_VALUE_SHOW:
            if (state.id !== action.layerId) {
                return state;
            }

            return {
                ...state,
                coordinate: action.coordinate,
            };

        default:
            return state;
    }
};

const orgUnit = (state, action) => {
    switch (action.type) {
        case types.ORGANISATION_UNIT_SELECT:
            if (state.id !== action.featureId) {
                return state;
            }

            return {
                ...state,
                isSelected: true,
            };

        case types.ORGANISATION_UNIT_UNSELECT:
            if (state.id !== action.featureId) {
                return state;
            }

            return {
                ...state,
                isSelected: false,
            };

        case types.ORGANISATION_UNIT_COORDINATE_CHANGE:
            if (state.id !== action.featureId) {
                return state;
            }

            return {
                ...state,
                geometry: {
                    ...state.geometry,
                    coordinates: action.coordinate,
                },
            };

        default:
            return state;
    }
};

const map = (state = defaultState, action) => {
    switch (action.type) {
        case types.MAP_NEW:
            return {
                ...defaultState,
            };

        case types.MAP_SET:
            return {
                ...defaultState,
                ...action.payload,
            };

        case types.MAP_NAME_SET:
            return {
                ...state,
                name: action.payload,
            };

        case types.MAP_COORDINATE_OPEN:
            return {
                ...state,
                coordinatePopup: action.payload,
            };

        case types.MAP_COORDINATE_CLOSE:
            return {
                ...state,
                coordinatePopup: null,
            };

        case types.BASEMAP_SELECTED:
        case types.BASEMAP_CHANGE_OPACITY:
        case types.BASEMAP_TOGGLE_EXPAND:
        case types.BASEMAP_TOGGLE_VISIBILITY:
            return {
                ...state,
                basemap: basemap(state.basemap, action),
            };

        case types.MAP_UPDATE:
            return {
                ...state,
                ...action.payload,
            };

        case types.LAYER_ADD:
            // Check to only allow external layers to be added once
            if (state.mapViews.filter(l => l.id === action.payload.id).length) {
                return state;
            }

            return {
                ...state,
                mapViews: [
                    ...state.mapViews,
                    {
                        id: generateUid(),
                        ...action.payload,
                    },
                ],
            };

        case types.LAYER_ADD_DATA:
            return {
                ...state,
            };

        case types.LAYER_LOAD:
            return {
                ...state,
            };

        case types.LAYER_REMOVE:
            return {
                ...state,
                mapViews: state.mapViews.filter(
                    layer => layer.id !== action.id
                ),
            };

        case types.LAYER_SORT:
            const mapViews = [...state.mapViews].reverse(); // TODO: Refactor
            const sortedMapViews = arrayMove(
                mapViews,
                action.oldIndex,
                action.newIndex
            ).reverse();

            return {
                ...state,
                mapViews: sortedMapViews,
            };

        case types.LAYER_LOAD:
        case types.LAYER_UPDATE:
        case types.LAYER_EDIT:
        case types.LAYER_CHANGE_OPACITY:
        case types.LAYER_TOGGLE_VISIBILITY:
        case types.LAYER_TOGGLE_EXPAND:
        case types.ORGANISATION_UNIT_SELECT:
        case types.ORGANISATION_UNIT_UNSELECT:
        case types.ORGANISATION_UNIT_COORDINATE_CHANGE:
        case types.ORGANISATION_UNITS_FILTER:
        case types.DATA_FILTER_SET:
        case types.DATA_FILTER_CLEAR:
        case types.MAP_EARTH_ENGINE_VALUE_SHOW:
            return {
                ...state,
                mapViews: state.mapViews.map(l => layer(l, action)),
            };

        case types.ALERTS_CLEAR:
            return {
                ...state,
                alerts: null,
                mapViews: state.mapViews.map(l => layer(l, action)),
            };

        default:
            return state;
    }
};

export default map;
