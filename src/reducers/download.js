import * as types from '../constants/actionTypes.js'

const defaultState = {
    downloadMode: false,
    isPushAnalytics: false,
    showName: true,
    showDescription: true,
    showLegend: true,
    showInLegend: [],
    showOverviewMap: true,
    hasOverviewMapSpace: true,
    showNorthArrow: true,
    northArrowPosition: 'bottomright',
    includeMargins: true,
}

const download = (state = defaultState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_MODE_SET:
            return {
                ...state,
                downloadMode: action.payload.downloadMode,
                isPushAnalytics: action.payload.isPushAnalytics,
            }

        case types.DOWNLOAD_CONFIG_SET:
            return {
                ...state,
                ...action.payload,
            }

        default:
            return state
    }
}

export default download
