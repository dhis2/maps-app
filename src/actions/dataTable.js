import * as types from '../constants/actionTypes.js'

export const closeDataTable = () => ({
    type: types.DATA_TABLE_CLOSE,
})

export const toggleDataTable = (id) => ({
    type: types.DATA_TABLE_TOGGLE,
    id,
})

export const resizeDataTable = (height) => ({
    type: types.DATA_TABLE_RESIZE,
    height,
})

export const setMapBounds = (bounds) => ({
    type: types.MAP_BOUNDS_CHANGED,
    bounds,
})

export const toggleShowOnlyFeaturesInView = () => ({
    type: types.TOGGLE_SHOW_ONLY_IN_VIEW,
})

export const setSelectionFilter = (value) => ({
    type: types.SELECTION_FILTER_SET,
    value,
})

export const setHighlightColor = (color) => ({
    type: types.HIGHLIGHT_COLOR_SET,
    color,
})
