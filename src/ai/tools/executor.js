import { makeAddFacilityLayer } from './addFacilityLayer.js'
import { makeAddOrgUnitLayer } from './addOrgUnitLayer.js'
import { makeAddThematicLayer } from './addThematicLayer.js'
import { makeListLayers } from './listLayers.js'
import { makeRemoveLayer } from './removeLayer.js'
import { makeResolveOrgUnits } from './resolveOrgUnits.js'
import { makeResolvePeriods } from './resolvePeriods.js'
import { makeSearchDataItems } from './searchDataItems.js'
import { makeSearchOrgUnitGroupSets } from './searchOrgUnitGroupSets.js'
import { makeUpdateLayer } from './updateLayer.js'
import { makeValidatePeriods } from './validatePeriods.js'

/**
 * Build the tool registry — a map from tool name to async function.
 *
 * @param {Object} deps
 * @param {Object} deps.engine - @dhis2/app-runtime data engine
 * @param {Function} deps.dispatch - Redux dispatch
 * @param {Function} deps.getState - Redux getState
 * @returns {Record<string, (args: Object) => Promise<Object>>}
 */
export const buildToolRegistry = ({ engine, dispatch, getState }) => ({
    search_data_items: makeSearchDataItems(engine),
    resolve_org_units: makeResolveOrgUnits(engine),
    search_org_unit_group_sets: makeSearchOrgUnitGroupSets(engine),
    resolve_periods: makeResolvePeriods(),
    list_layers: makeListLayers(getState),
    add_thematic_layer: makeAddThematicLayer(dispatch, getState),
    add_facility_layer: makeAddFacilityLayer(dispatch, getState),
    add_org_unit_layer: makeAddOrgUnitLayer(dispatch, getState),
    update_layer: makeUpdateLayer(dispatch, getState),
    remove_layer: makeRemoveLayer(dispatch, getState),
    validate_periods: makeValidatePeriods(),
})

/**
 * Execute a tool call and return a stringified result.
 * Validates the tool name; passes args through as-is (schema validation is
 * the LLM connector's responsibility via constrained decoding).
 *
 * @param {Record<string, Function>} registry
 * @param {{ id: string, name: string, args: Object }} toolCall
 * @returns {Promise<{ tool_use_id: string, content: string }>}
 */
export const executeToolCall = async (registry, toolCall) => {
    const fn = registry[toolCall.name]

    if (!fn) {
        return {
            tool_use_id: toolCall.id,
            content: JSON.stringify({
                error: `Unknown tool "${
                    toolCall.name
                }". Available tools: ${Object.keys(registry).join(', ')}`,
            }),
        }
    }

    try {
        const result = await fn(toolCall.args)
        return {
            tool_use_id: toolCall.id,
            content: JSON.stringify(result),
        }
    } catch (err) {
        return {
            tool_use_id: toolCall.id,
            content: JSON.stringify({ error: err.message }),
        }
    }
}
