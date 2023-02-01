import * as types from '../constants/actionTypes.js'

const defaultState = {
    downloadMode: true,
    showName: true,
    showLegend: true,
}

const download = (state = defaultState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_MODE_TOGGLE:
            return {
                ...state,
                downloadMode: action.payload,
            }

        case types.DOWNLOAD_NAME_SHOW_TOGGLE:
            return {
                ...state,
                showName: action.payload,
            }

        case types.DOWNLOAD_LEGEND_SHOW_TOGGLE:
            return {
                ...state,
                showLegend: action.payload,
            }

        default:
            return state
    }
}

export default download
