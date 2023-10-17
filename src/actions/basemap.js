import * as types from '../constants/actionTypes.js'

export const addBasemaps = (basemaps) => ({
    type: types.BASEMAPS_ADD,
    payload: basemaps,
})

export const selectBasemap = (payload) => ({
    type: types.BASEMAP_SELECTED,
    payload,
})

export const toggleBasemapExpand = () => ({
    type: types.BASEMAP_TOGGLE_EXPAND,
})

export const toggleBasemapVisibility = () => ({
    type: types.BASEMAP_TOGGLE_VISIBILITY,
})

export const changeBasemapOpacity = (opacity) => ({
    type: types.BASEMAP_CHANGE_OPACITY,
    opacity,
})

export const setBingMapsApiKey = (key) => ({
    type: types.BASEMAP_BING_KEY_SET,
    key,
})

export const removeBingBasemaps = () => ({
    type: types.BASEMAP_REMOVE_BING_MAPS,
})
