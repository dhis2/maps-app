import * as types from '../constants/actionTypes';

// Set download state (download dialog is open)
export const setDownloadState = isActive => ({
    type: types.DOWNLOAD_STATE_SET,
    payload: isActive,
});

// Weather the legend should be included on the map download
export const setDownloadLegendState = show => ({
    type: types.DOWNLOAD_LEGEND_STATE_SET,
    payload: show,
});

// Legend corner position
export const setDownloadLegendPosition = position => ({
    type: types.DOWNLOAD_LEGEND_POSITION_SET,
    payload: position,
});
