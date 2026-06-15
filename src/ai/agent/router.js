import { INTENT } from './systemPrompt.js'

/**
 * Two-step router: classify the user's intent, then expose only the relevant
 * tool subset. This dramatically improves reliability with 7–8B local models
 * by reducing the number of choices the model must make per call.
 */

const DECLINE_PATTERNS = [
    /analys[ei]|interpret|what does|explain|why is|trend|pattern|insight/i,
    /patient|individual|person named|tracked entit|line list/i,
    /event.*report|report.*event/i,
]

const THEMATIC_PATTERNS = [
    /choropleth|bubble\s+map|incidence|coverage|rate|ratio|proportion|attendance|cases|indicator|data element/i,
    /malaria|anc|bcg|opd|hiv|tuberculosis|stock.out|mortality|morbidity/i,
]

const FACILITY_PATTERNS = [
    /facilit|health\s+(post|centre|center|facility|clinic)|hospital/i,
]

const ORG_UNIT_PATTERNS = [
    /boundar|org\s+unit\s+layer|administrative|chiefdom|district\s+boundary|region\s+boundary/i,
]

const EDIT_PATTERNS = [
    /change|update|modify|switch|make it|convert|turn it|set.*period|set.*org/i,
]

const REMOVE_PATTERNS = [/remove|delete|hide|clear|drop|get rid/i]

/**
 * Classify user intent from the latest user message.
 * @param {string} text
 * @returns {string} one of INTENT.*
 */
export const classifyIntent = (text) => {
    if (DECLINE_PATTERNS.some((p) => p.test(text))) {
        return INTENT.DECLINE
    }
    if (REMOVE_PATTERNS.some((p) => p.test(text))) {
        return INTENT.REMOVE
    }
    if (EDIT_PATTERNS.some((p) => p.test(text))) {
        return INTENT.EDIT
    }
    if (FACILITY_PATTERNS.some((p) => p.test(text))) {
        return INTENT.ADD_FACILITY
    }
    if (ORG_UNIT_PATTERNS.some((p) => p.test(text))) {
        return INTENT.ADD_ORG_UNIT
    }
    if (THEMATIC_PATTERNS.some((p) => p.test(text))) {
        return INTENT.ADD_THEMATIC
    }
    // Default: let the model figure it out with all tools
    return INTENT.ADD_THEMATIC
}

/**
 * Return the tool name subset for a given intent.
 * Edit/remove always start with list_layers.
 * @param {string} intent
 * @returns {string[]}
 */
export const getToolsForIntent = (intent) => {
    switch (intent) {
        case INTENT.ADD_THEMATIC:
            return [
                'search_data_items',
                'resolve_org_units',
                'resolve_periods',
                'add_thematic_layer',
            ]
        case INTENT.ADD_FACILITY:
            return [
                'resolve_org_units',
                'search_org_unit_group_sets',
                'add_facility_layer',
            ]
        case INTENT.ADD_ORG_UNIT:
            return [
                'resolve_org_units',
                'search_org_unit_group_sets',
                'add_org_unit_layer',
            ]
        case INTENT.EDIT:
            return [
                'list_layers',
                'resolve_org_units',
                'resolve_periods',
                'search_data_items',
                'search_org_unit_group_sets',
                'update_layer',
            ]
        case INTENT.REMOVE:
            return ['list_layers', 'remove_layer']
        default:
            return []
    }
}

/**
 * Decline message for out-of-scope requests.
 * @param {string} text
 * @returns {string|null} decline message or null if not declined
 */
export const getDeclineMessage = (text) => {
    if (/analys[ei]|interpret|explain|insight|trend|pattern/i.test(text)) {
        return "I can add, edit, and remove map layers, but I can't analyse or interpret map data here. Try the interpretations panel for commentary."
    }
    if (/patient|individual|person named|tracked entit|line list/i.test(text)) {
        return 'Individual-level and tracked entity data is not available through this assistant.'
    }
    return null
}
