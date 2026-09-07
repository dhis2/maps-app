import * as types from '../constants/actionTypes.js'

const defaultState = { layerId: null, ids: [] }

const toggleFeatureSelection = (state, action) => {
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

const addSelectionRange = (state, action) => {
    const ids = state.layerId === action.layerId ? state.ids : []

    return {
        layerId: action.layerId,
        ids: [...new Set([...ids, ...action.ids])],
    }
}

const selection = (state = defaultState, action) => {
    switch (action.type) {
        case types.FEATURE_TOGGLE_SELECTION:
            return toggleFeatureSelection(state, action)

        case types.SELECTION_SET_ALL:
            return { layerId: action.layerId, ids: action.ids }

        case types.SELECTION_ADD_RANGE:
            return addSelectionRange(state, action)

        case types.SELECTION_CLEAR:
        case types.MAP_NEW:
        case types.MAP_SET:
            return defaultState

        case types.LAYER_REMOVE:
            return state.layerId === action.id ? defaultState : state

        default:
            return state
    }
}

export default selection
