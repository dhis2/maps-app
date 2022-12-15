import * as types from '../constants/actionTypes.js'

// Set download state (download dialog is open)
export const toggleDownloadDialog = (show) => ({
    type: types.DOWNLOAD_DIALOG_TOGGLE,
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
