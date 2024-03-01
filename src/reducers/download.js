import * as types from '../constants/actionTypes.js'

const defaultState = {
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
