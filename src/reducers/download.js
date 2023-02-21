import * as types from '../constants/actionTypes.js'

const defaultState = {
    downloadMode: false,
    showName: true,
    showDescription: true,
    showLegend: true,
    showInsetMap: true,
    showNorthArrow: true,
    northArrowPosition: 'bottomright',
    includeMargins: true,
}

const download = (state = defaultState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_MODE_TOGGLE:
            return {
                ...state,
                downloadMode: action.payload,
            }

        case types.DOWNLOAD_PROPERTY_SET:
            return {
                ...state,
                ...action.payload,
            }

        default:
            return state
    }
}

export default download
