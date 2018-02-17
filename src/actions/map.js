import * as types from '../constants/actionTypes';

export const newMap = () => ({
  type: types.MAP_NEW,
});

export const setMap = (config) => ({
    type: types.MAP_SET,
    payload: config,
});

export const openCoordinatePopup = (coord) => ({
    type: types.MAP_COORDINATE_OPEN,
    payload: coord,
});

export const closeCoordinatePopup = (coord) => ({
    type: types.MAP_COORDINATE_CLOSE,
});

export const openContextMenu = (payload) => ({
    type: types.MAP_CONTEXT_MENU_OPEN,
    payload,
});

export const closeContextMenu = () => ({
    type: types.MAP_CONTEXT_MENU_CLOSE,
});

export const removeAlerts = () => ({
    type: types.ALERTS_REMOVE,
});