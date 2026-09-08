import * as types from '../constants/actionTypes.js'

const initialState = {
    openIds: [],
    combinedView: false,
    isPanelVisible: false,
    activeLayerId: null,
}

const dataTable = (state = initialState, action) => {
    switch (action.type) {
        case types.DOWNLOAD_MODE_CLOSE:
        case types.DOWNLOAD_MODE_OPEN:
        case types.MAP_NEW:
        case types.MAP_SET:
            return initialState

        case types.DATA_TABLE_CLOSE:
            return { ...state, isPanelVisible: false }

        case types.DATA_TABLE_OPEN:
            return { ...state, isPanelVisible: true }

        case types.DATA_TABLE_ACTIVE_LAYER_SET:
            return { ...state, activeLayerId: action.id }

        case types.DATA_TABLE_TOGGLE: {
            const isOpening = !state.openIds.includes(action.id)
            const openIds = isOpening
                ? [...state.openIds, action.id]
                : state.openIds.filter((id) => id !== action.id)
            return {
                ...state,
                openIds,
                isPanelVisible: isOpening ? true : state.isPanelVisible,
            }
        }

        case types.LAYER_REMOVE:
            return {
                ...state,
                openIds: state.openIds.filter((id) => id !== action.id),
                activeLayerId:
                    state.activeLayerId === action.id
                        ? null
                        : state.activeLayerId,
            }

        case types.DATA_TABLE_COMBINED_VIEW_TOGGLE: {
            const combinedView = !state.combinedView
            return {
                ...state,
                combinedView,
                isPanelVisible: combinedView ? true : state.isPanelVisible,
            }
        }

        default:
            return state
    }
}

export default dataTable
