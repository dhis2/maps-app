import * as types from '../constants/actionTypes.js'

const defaultState = {
    dialogOpen: false,
    downloading: false,
    error: null,
    layerid: undefined,
}

const dataDownloadReducer = (state = defaultState, action) => {
    switch (action.type) {
        case types.DATA_DOWNLOAD_OPEN_DIALOG:
            return {
                ...state,
                dialogOpen: true,
                layerid: action.payload.layerid,
            }
        case types.DATA_DOWNLOAD_START:
            return { ...state, downloading: true }
        case types.DATA_DOWNLOAD_CLOSE_DIALOG:
        case types.DATA_DOWNLOAD_SUCCESS:
            return { ...defaultState }
        case types.DATA_DOWNLOAD_FAILURE:
            return { ...state, downloading: false, error: action.error }
    }
    return state
}

export default dataDownloadReducer
