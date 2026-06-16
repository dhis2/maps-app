import { updateLayer } from '../../actions/layers.js'
import { makeValidatePeriods } from './validatePeriods.js'

const _validatePeriods = makeValidatePeriods()

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
        const mapViews = map?.mapViews ?? []

        // Try exact ID match first, then fall back to name substring match
        const layer =
            mapViews.find((l) => l.id === layerId) ??
            mapViews.find((l) =>
                l.name?.toLowerCase().includes(layerId.toLowerCase())
            )

        if (!layer) {
            return {
                success: false,
                message: `No layer found matching "${layerId}". Call list_layers to see available layers and their ids.`,
            }
        }

        // Validate periods before applying — catch hallucinated IDs early
        if (changes.periods?.length) {
            const validation = await _validatePeriods({
                periods: changes.periods,
            })
            if (!validation.allValid) {
                const bad = validation.results.filter((r) => !r.valid)
                return {
                    success: false,
                    message:
                        bad.map((r) => r.suggestion).join(' ') +
                        ' Call resolve_periods with a natural language description to get valid ids.',
                }
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
        const normalizePeriodId = (p) => {
            let n = p.replace(/^P_/i, '')
            n = n.replace(/^(\d{4})[-_]Q([1-4])$/i, '$1Q$2')
            n = n.replace(/^Q([1-4])[-_ ](\d{4})$/i, '$2Q$1')
            n = n.replace(/^(\d{4})[-_](\d{2})$/, '$1$2')
            n = n.replace(/^PREVIOUS_YEAR$/i, 'LAST_YEAR')
            n = n.replace(/^CURRENT_YEAR$/i, 'THIS_YEAR')
            n = n.replace(/^PREVIOUS_QUARTER$/i, 'LAST_QUARTER')
            n = n.replace(/^CURRENT_QUARTER$/i, 'THIS_QUARTER')
            n = n.replace(/^PREVIOUS_MONTH$/i, 'LAST_MONTH')
            n = n.replace(/^CURRENT_MONTH$/i, 'THIS_MONTH')
            return n
        }
        const existingFilters = layer.filters ?? []
        patch.filters = [
            ...existingFilters.filter((f) => f.dimension !== 'pe'),
            {
                dimension: 'pe',
                items: changes.periods.map((pe) => ({
                    id: normalizePeriodId(pe),
                })),
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
