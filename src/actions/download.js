import * as types from '../constants/actionTypes.js'

export const setDownloadMode = (payload) => ({
    type: types.DOWNLOAD_MODE_SET,
    payload,
})

export const setDownloadConfig = (payload) => ({
    type: types.DOWNLOAD_CONFIG_SET,
    payload,
})
