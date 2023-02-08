import * as types from '../constants/actionTypes.js'

// Toggle download mode
export const toggleDownloadMode = (payload) => ({
    type: types.DOWNLOAD_MODE_TOGGLE,
    payload,
})

// Set downlond property
export const setDownloadProperty = (payload) => ({
    type: types.DOWNLOAD_PROPERTY_SET,
    payload,
})
