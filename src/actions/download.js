import * as types from '../constants/actionTypes.js'

// Toggle download mode
export const toggleDownloadMode = (payload) => ({
    type: types.DOWNLOAD_MODE_TOGGLE,
    payload,
})

// Whether the name should be included on the map download
export const toggleDownloadShowName = (payload) => ({
    type: types.DOWNLOAD_NAME_SHOW_TOGGLE,
    payload,
})

// Whether the name should be included on the map download
export const toggleDownloadShowDescription = (payload) => ({
    type: types.DOWNLOAD_DESCRIPTION_SHOW_TOGGLE,
    payload,
})

// Whether the legend should be included on the map download
export const toggleDownloadShowLegend = (payload) => ({
    type: types.DOWNLOAD_LEGEND_SHOW_TOGGLE,
    payload,
})

// Whether the legend should be included on the map download
export const toggleDownloadNorthArrow = (payload) => ({
    type: types.DOWNLOAD_NORTH_ARROW_TOGGLE,
    payload,
})
