import * as types from '../constants/actionTypes.js'

const defaultState = { layerId: null, ids: [] }

const removeCrossLayerId = (crossLayerIds, layerId) => {
    if (!crossLayerIds?.[layerId]) {
        return crossLayerIds
    }
    return Object.fromEntries(
        Object.entries(crossLayerIds).filter(([id]) => id !== layerId)
    )
}

const selection = (state = defaultState, action) => {
    switch (action.type) {
        case types.FEATURE_TOGGLE_SELECTION: {
            if (state.layerId !== action.layerId) {
                return { layerId: action.layerId, ids: [action.id] }
            }

            const alreadySelected = state.ids.includes(action.id)

            return {
                layerId: action.layerId,
                ids: alreadySelected
                    ? state.ids.filter((id) => id !== action.id)
                    : [...state.ids, action.id],
            }
        }

        case types.SELECTION_SET_ALL:
            return { layerId: action.layerId, ids: action.ids }

        case types.SELECTION_ADD_RANGE: {
            const ids = state.layerId === action.layerId ? state.ids : []

            return {
                layerId: action.layerId,
                ids: [...new Set([...ids, ...action.ids])],
            }
        }

        case types.SELECTION_SET_CROSS_LAYER:
            return Object.keys(action.crossLayerIds).length
                ? {
                      layerId: null,
                      ids: [],
                      crossLayerIds: action.crossLayerIds,
                  }
                : defaultState

        case types.SELECTION_CLEAR:
        case types.MAP_NEW:
        case types.MAP_SET:
        case types.DATA_TABLE_CLOSE:
            return defaultState

        case types.DATA_TABLE_TOGGLE:
            return state.layerId === action.id ? defaultState : state

        case types.LAYER_REMOVE: {
            if (state.layerId === action.id) {
                return defaultState
            }
            const crossLayerIds = removeCrossLayerId(
                state.crossLayerIds,
                action.id
            )
            if (crossLayerIds === state.crossLayerIds) {
                return state
            }
            return Object.keys(crossLayerIds).length
                ? { ...state, crossLayerIds }
                : defaultState
        }

        default:
            return state
    }
}

export default selection
