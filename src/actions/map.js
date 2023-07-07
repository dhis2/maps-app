import * as types from '../constants/actionTypes.js'

export const newMap = () => ({
    type: types.MAP_NEW,
})

export const setMap = (config) => ({
    type: types.MAP_SET,
    payload: config,
})

export const setMapProps = (props) => ({
    type: types.MAP_PROPS_SET,
    payload: props,
})

export const openCoordinatePopup = (coord) => ({
    type: types.MAP_COORDINATE_OPEN,
    payload: coord,
})

export const closeCoordinatePopup = () => ({
    type: types.MAP_COORDINATE_CLOSE,
})

export const openContextMenu = (payload) => ({
    type: types.MAP_CONTEXT_MENU_OPEN,
    payload,
})

export const closeContextMenu = () => ({
    type: types.MAP_CONTEXT_MENU_CLOSE,
})

export const showEarthEngineValue = (layerId, coordinate) => ({
    type: types.MAP_EARTH_ENGINE_VALUE_SHOW,
    layerId,
    coordinate,
})
