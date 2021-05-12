import * as types from '../constants/actionTypes';

export const openDataDownloadDialog = layerid => ({
    type: types.DATA_DOWNLOAD_OPEN_DIALOG,
    payload: {
        layerid,
    },
});

export const closeDataDownloadDialog = () => ({
    type: types.DATA_DOWNLOAD_CLOSE_DIALOG,
});

export const startDataDownload = payload => ({
    type: types.DATA_DOWNLOAD_START,
    payload,
});

export const cancelDataDownload = () => ({
    type: types.DATA_DOWNLOAD_CANCEL,
});

export const dataDownloadSuccess = () => ({
    type: types.DATA_DOWNLOAD_SUCCESS,
});
