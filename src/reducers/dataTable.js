import * as types from '../constants/actionTypes.js'

const initialState = {
    openIds: [],
    combinedView: false,
}

const dataTable = (state = initialState, action) => {
    switch (action.type) {
        case types.DATA_TABLE_CLOSE:
        case types.DOWNLOAD_MODE_CLOSE:
        case types.DOWNLOAD_MODE_OPEN:
        case types.MAP_NEW:
        case types.MAP_SET:
            return initialState

        case types.DATA_TABLE_TOGGLE: {
            const openIds = state.openIds.includes(action.id)
                ? state.openIds.filter((id) => id !== action.id)
                : [...state.openIds, action.id]
            return { ...state, openIds }
        }

        case types.LAYER_REMOVE:
            return {
                ...state,
                openIds: state.openIds.filter((id) => id !== action.id),
            }

        case types.DATA_TABLE_COMBINED_VIEW_TOGGLE:
            return { ...state, combinedView: !state.combinedView }

        default:
            return state
    }
}

export default dataTable
