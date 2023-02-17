import * as types from '../constants/actionTypes.js'

export const openDataDownloadDialog = (layerid) => ({
    type: types.DATA_DOWNLOAD_OPEN_DIALOG,
    payload: {
        layerid,
    },
})

export const closeDataDownloadDialog = () => ({
    type: types.DATA_DOWNLOAD_CLOSE_DIALOG,
})
