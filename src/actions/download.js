import * as types from '../constants/actionTypes.js'

// Toggle download mode
export const toggleDownloadMode = (show) => ({
    type: types.DOWNLOAD_MODE_TOGGLE,
    payload: show,
})

// Whether the name should be included on the map download
export const toggleDownloadShowName = (show) => ({
    type: types.DOWNLOAD_NAME_SHOW_TOGGLE,
    payload: show,
})

// Whether the legend should be included on the map download
export const toggleDownloadShowLegend = (show) => ({
    type: types.DOWNLOAD_LEGEND_SHOW_TOGGLE,
    payload: show,
})

// Legend corner position
export const setDownloadLegendPosition = (position) => ({
    type: types.DOWNLOAD_LEGEND_POSITION_SET,
    payload: position,
})
