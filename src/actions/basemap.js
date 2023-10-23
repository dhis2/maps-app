import * as types from '../constants/actionTypes.js'

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
