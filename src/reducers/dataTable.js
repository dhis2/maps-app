import * as types from '../constants/actionTypes.js'

// joinConfig.layers is keyed by participating layer id: { type: 'orgUnit' |
// 'spatial', aggregation: { [dataKey]: aggregationTypeId } }. The reference
// org unit set itself isn't stored here at all - it's derived from
// state.map.mapViews (the one layer with layer === COMBINED_TABLE_REF_LAYER),
// same as any other layer lookup, rather than duplicated into this slice.
const initialState = {
    openIds: [],
    combinedView: false,
    joinConfig: {
        layers: {},
    },
}

const dataTable = (state = initialState, action) => {
    switch (action.type) {
        // Closes the whole panel (or leaves the data table view while
        // entering/exiting download mode) - resets which tab(s) are open
        // and whether Combined is the active view, but preserves joinConfig
        // itself. joinConfig is real, savable configuration now (see
        // favorites.js/FileMenu.jsx), not just session-only display state -
        // wiping it here would silently discard it the moment a user closes
        // the panel before saving, an extremely common, low-stakes action
        // that has nothing to do with abandoning their join setup.
        case types.DATA_TABLE_CLOSE:
        case types.DOWNLOAD_MODE_CLOSE:
        case types.DOWNLOAD_MODE_OPEN:
            return { ...initialState, joinConfig: state.joinConfig }

        case types.MAP_NEW:
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
            // Only prunes a removed *participating* layer's own join
            // settings - this reducer only sees its own slice, not
            // state.map.mapViews, so it can't tell here whether the removed
            // layer was instead the reference layer itself. Not a gap in
            // practice yet: the reference layer has no delete affordance of
            // its own (it's hidden from the normal layer list/cards), so
            // that case has no way to be triggered today. A future
            // "reset reference" action would need to turn combinedView off
            // itself when it removes the reference layer.
            const layers = { ...state.joinConfig.layers }
            delete layers[action.id]
            return {
                ...state,
                openIds: state.openIds.filter((id) => id !== action.id),
                joinConfig: { ...state.joinConfig, layers },
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
