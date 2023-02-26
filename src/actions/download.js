import * as types from '../constants/actionTypes.js'

// Toggle download mode
export const setDownloadMode = (payload) => ({
    type: types.DOWNLOAD_MODE_SET,
    payload,
})

// Set downlond property
export const setDownloadConfig = (payload) => ({
    type: types.DOWNLOAD_CONFIG_SET,
    payload,
})
