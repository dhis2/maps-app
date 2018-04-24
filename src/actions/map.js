import * as types from '../constants/actionTypes';

export const newMap = () => ({
    type: types.MAP_NEW,
});

export const setMap = config => ({
    type: types.MAP_SET,
    payload: config,
});

export const setMapName = name => ({
    type: types.MAP_NAME_SET,
    payload: name,
});

export const openCoordinatePopup = coord => ({
    type: types.MAP_COORDINATE_OPEN,
    payload: coord,
});

export const closeCoordinatePopup = coord => ({
    type: types.MAP_COORDINATE_CLOSE,
});

export const openContextMenu = payload => ({
    type: types.MAP_CONTEXT_MENU_OPEN,
    payload,
});

export const closeContextMenu = () => ({
    type: types.MAP_CONTEXT_MENU_CLOSE,
});

export const showEarthEngineValue = (layerId, coordinate) => ({
    type: types.MAP_EARTH_ENGINE_VALUE_SHOW,
    layerId,
    coordinate,
});

export const updateMap = payload => ({
    type: types.MAP_UPDATE,
    payload,
});
