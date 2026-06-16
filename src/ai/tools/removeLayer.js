import { removeLayer } from '../../actions/layers.js'

/**
 * Remove a layer by ID or by name pattern.
 *
 * @param {Function} dispatch - Redux dispatch
 * @param {Function} [getState] - Redux getState (required for namePattern lookup)
 * @returns {(args: Object) => Promise<Object>}
 */
export const makeRemoveLayer =
    (dispatch, getState) =>
    async ({ layerId, namePattern }) => {
        let id = layerId
        if (!id && namePattern && getState) {
            const state = getState()
            const mapViews = state.map?.mapViews ?? []
            const layer = mapViews.find((l) =>
                l.name?.toLowerCase().includes(namePattern.toLowerCase())
            )
            if (!layer) {
                return {
                    success: false,
                    message: `No layer found matching "${namePattern}".`,
                }
            }
            id = layer.id
        }

        if (!id) {
            return {
                success: false,
                message: 'Provide layerId or namePattern.',
            }
        }

        dispatch(removeLayer(id))
        return { success: true, message: `Layer removed.` }
    }
