import * as types from '../constants/actionTypes.js'

const initialState = {
    openIds: [],
    combinedView: false,
    joinConfig: {
        level: 'orgUnit',
        layerIds: [],
        pointLayerId: null,
        polygonLayerId: null,
    },
}

const isJoinConfigSufficient = (joinConfig) =>
    joinConfig.level === 'spatial'
        ? !!joinConfig.pointLayerId && !!joinConfig.polygonLayerId
        : joinConfig.layerIds.length >= 2

const clearJoinConfigRefs = (joinConfig, removedId) => ({
    ...joinConfig,
    layerIds: joinConfig.layerIds.filter((id) => id !== removedId),
    pointLayerId:
        joinConfig.pointLayerId === removedId ? null : joinConfig.pointLayerId,
    polygonLayerId:
        joinConfig.polygonLayerId === removedId
            ? null
            : joinConfig.polygonLayerId,
})

const dataTable = (state = initialState, action) => {
    switch (action.type) {
        case types.DATA_TABLE_CLOSE:
        case types.MAP_NEW:
        case types.DOWNLOAD_MODE_CLOSE:
        case types.DOWNLOAD_MODE_OPEN:
            return initialState

        case types.MAP_SET:
            return action.payload.dataTable ?? initialState

        case types.DATA_TABLE_TOGGLE: {
            const openIds = state.openIds.includes(action.id)
                ? state.openIds.filter((id) => id !== action.id)
                : [...state.openIds, action.id]
            // combinedView/joinConfig are fully decoupled from openIds -
            // closing the last open tab this way doesn't touch them, even
            // if that empties openIds. isDataTableOpen() (util/dataTable.js)
            // is what decides whether the panel itself stays open, and it
            // already accounts for combinedView independently of openIds.
            return { ...state, openIds }
        }

        case types.LAYER_REMOVE: {
            const joinConfig = clearJoinConfigRefs(state.joinConfig, action.id)
            return {
                ...state,
                openIds: state.openIds.filter((id) => id !== action.id),
                joinConfig,
                combinedView:
                    state.combinedView && isJoinConfigSufficient(joinConfig),
            }
        }

        case types.DATA_TABLE_COMBINED_VIEW_TOGGLE:
            return { ...state, combinedView: !state.combinedView }

        case types.DATA_TABLE_JOIN_CONFIG_SET:
            return { ...state, joinConfig: action.config }

        default:
            return state
    }
}

export default dataTable
