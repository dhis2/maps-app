import * as types from '../constants/actionTypes.js'

export const setDownloadConfig = (payload) => ({
    type: types.DOWNLOAD_CONFIG_SET,
    payload,
})
