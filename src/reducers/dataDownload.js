import * as types from '../constants/actionTypes.js'

const defaultState = {
    dialogOpen: false,
    layerid: undefined,
}

const dataDownloadReducer = (state = defaultState, action) => {
    switch (action.type) {
        case types.DATA_DOWNLOAD_OPEN_DIALOG:
            return {
                dialogOpen: true,
                layerid: action.payload.layerid,
            }
        case types.DATA_DOWNLOAD_CLOSE_DIALOG:
        case types.DATA_DOWNLOAD_SUCCESS:
            return { ...defaultState }
    }
    return state
}

export default dataDownloadReducer
