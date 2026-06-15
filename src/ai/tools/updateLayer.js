import { updateLayer } from '../../actions/layers.js'

/**
 * Merge changes into an existing layer and re-trigger loading.
 * Mirrors the LayerEdit.jsx submit pattern: spread changes + flip isLoaded.
 *
 * @param {Function} dispatch - Redux dispatch
 * @param {() => Object} getState - Redux getState
 * @returns {(args: Object) => Promise<Object>}
 */
export const makeUpdateLayer =
    (dispatch, getState) =>
    async ({ layerId, changes }) => {
        const { map } = getState()
        const layer = (map?.mapViews ?? []).find((l) => l.id === layerId)

        if (!layer) {
            return {
                success: false,
                message: `No layer found with id "${layerId}". Call list_layers to see available layers.`,
            }
        }

        const mergedChanges = applyChanges(layer, changes)

        const config = {
            ...layer,
            ...mergedChanges,
            editCounter: (layer.editCounter ?? 0) + 1,
            isLoaded: false,
            isLoading: false,
            backupPeriodsDates: undefined,
        }

        dispatch(updateLayer(config))

        return {
            success: true,
            message: `Updated layer "${layerId}".`,
        }
    }

/**
 * Translate high-level change descriptions to layer config patches.
 * Handles the common cases the LLM will produce.
 */
const applyChanges = (layer, changes) => {
    const patch = {}

    if (changes.thematicMapType) {
        patch.thematicMapType = changes.thematicMapType
    }
    if (changes.method !== undefined) {
        patch.method = changes.method
    }
    if (changes.classes !== undefined) {
        patch.classes = changes.classes
    }

    // Period change: replace the pe filter
    if (changes.periods) {
        const existingFilters = layer.filters ?? []
        patch.filters = [
            ...existingFilters.filter((f) => f.dimension !== 'pe'),
            {
                dimension: 'pe',
                items: changes.periods.map((pe) => ({ id: pe })),
            },
        ]
    }

    // Org unit change: replace the ou row
    if (changes.orgUnits) {
        const existingRows = layer.rows ?? []
        patch.rows = [
            ...existingRows.filter((r) => r.dimension !== 'ou'),
            {
                dimension: 'ou',
                items: changes.orgUnits.map((ou) => ({ id: ou })),
            },
        ]
    }

    // Group set change
    if (changes.organisationUnitGroupSetId !== undefined) {
        patch.organisationUnitGroupSet = changes.organisationUnitGroupSetId
            ? { id: changes.organisationUnitGroupSetId }
            : undefined
    }

    return patch
}
