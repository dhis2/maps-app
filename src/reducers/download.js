import * as types from '../constants/actionTypes.js'

const defaultState = {
    downloadMode: true,
    showName: true,
    showDescription: true,
    showLegend: true,
    showNorthArrow: true,
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

        case types.DOWNLOAD_DESCRIPTION_SHOW_TOGGLE:
            return {
                ...state,
                showDescription: action.payload,
            }

        case types.DOWNLOAD_LEGEND_SHOW_TOGGLE:
            return {
                ...state,
                showLegend: action.payload,
            }

        case types.DOWNLOAD_NORTH_ARROW_TOGGLE:
            return {
                ...state,
                showNorthArrow: action.payload,
            }

        default:
            return state
    }
}

export default download
