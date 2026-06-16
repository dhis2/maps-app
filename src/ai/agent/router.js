import { INTENT } from './systemPrompt.js'

/**
 * Two-step router: classify the user's intent, then expose only the relevant
 * tool subset. This dramatically improves reliability with 7–8B local models
 * by reducing the number of choices the model must make per call.
 */

// Pure acknowledgments / comments that should not trigger any map action
const COMMENT_PATTERNS = [
    /^(ok|okay|great|thanks|thank you|i see|understood|alright|cool|perfect|nice|noted|got it|sounds good)\s*[.!]?$/i,
    // Combinations like "great, thanks!" or "thanks, that's perfect"
    /^(great|perfect|nice|cool|awesome)[,!]?\s*(thanks|thank you)[.!]?$/i,
    /^(thanks|thank you)[,!]?\s*(that[''s]?\s*(great|perfect|good|helpful|awesome)|so much)[.!]?$/i,
    /^(you[''re\s]+welcome|no problem|sure)[.!]?$/i,
    /^(that|this)\s+(is|'?s)\b/i,
    /^yes[,.]?\s*(?:that['']s|it(?:'?s)?|those are)\b/i,
]

const DECLINE_PATTERNS = [
    /analys[ei]|interpret|what does|explain|why is|trend|pattern|insight/i,
    /\bpatient\b|\bindividual\b|\bperson named\b|\btracked entit|\bline list\b/i,
    /event.*report|report.*event/i,
    // Comparative / ranking analytical questions (question-word + superlative, or counting)
    /\b(which|what)\b.{1,60}\b(highest|lowest|most|fewest|least|greatest|smallest|worst|best|most affected)\b/i,
    /\bhow\s+many\b/i,
]

const THEMATIC_PATTERNS = [
    /choropleth|bubble\s+map|incidence|coverage|rate|ratio|proportion|attendance|cases|indicator|data element/i,
    /malaria|anc|bcg|opd|hiv|tuberculosis|stock.out|mortality|morbidity/i,
]

const FACILITY_PATTERNS = [
    /facilit|health\s+(post|centre|center|facility|clinic)|hospital/i,
]

const ORG_UNIT_PATTERNS = [/boundar|org\s+unit\s+layer|administrative/i]

const EDIT_PATTERNS = [
    /change|update|modify|switch|make it|convert|turn it|set.*period|set.*org/i,
    // Map type changes: "switch/convert to bubble", "show it as a choropleth", "as a bubble map"
    /\b(switch|convert|turn)\b.{0,40}\b(bubble|choropleth)\b/i,
    /\bas\s+a?\s*(bubble|choropleth)\b/i,
    // Level navigation: "go down to chiefdoms", "drill into districts", "zoom out to regions"
    /\b(go|drill|zoom|move|jump)\s+(up|down|in|out|into|deeper|higher|lower|to)\b/i,
    // "down to X level" / "up to X level" without leading verb
    /\b(down|up)\s+to\b.{0,30}\b(level|district|chiefdom|region|province|national|ward)\b/i,
]

const EXPLORE_PATTERNS = [
    // Plural data-type words = browsing ("list ANC indicators", "show me BCG datasets")
    // Singular is excluded on purpose — "add an ANC indicator" should route to ADD
    /\b(list|show me|find|search for|can you list|please list|check|browse|look at|see)\b.{0,60}\b(indicators|data elements|datasets|programs)\b/i,
    // "what/which X indicators are available/related/there"
    /\b(what|which)\b.{0,60}\b(indicators?|data elements?|datasets?|programs?)\b.{0,40}\b(available|exist|related|there|do you have)\b/i,
    // Generic availability
    /\bwhat.{0,40}(available|exist)\b/i,
]

const REMOVE_PATTERNS = [/remove|delete|hide|clear|drop|get rid/i]

// Compound: remove one layer AND add another in the same turn
const COMPOUND_PATTERNS = [
    /\b(remove|delete|hide|clear|drop)\b.*\b(then|and|,)\b.*(add|show|create|display)/i,
]

/**
 * Classify user intent from the latest user message.
 * @param {string} text
 * @returns {string} one of INTENT.*
 */
export const classifyIntent = (text, history = []) => {
    if (COMMENT_PATTERNS.some((p) => p.test(text.trim()))) {
        return INTENT.DECLINE
    }
    if (DECLINE_PATTERNS.some((p) => p.test(text))) {
        return INTENT.DECLINE
    }
    if (COMPOUND_PATTERNS.some((p) => p.test(text))) {
        return INTENT.COMPOUND
    }
    if (REMOVE_PATTERNS.some((p) => p.test(text))) {
        return INTENT.REMOVE
    }
    if (EDIT_PATTERNS.some((p) => p.test(text))) {
        return INTENT.EDIT
    }
    if (EXPLORE_PATTERNS.some((p) => p.test(text))) {
        return INTENT.EXPLORE
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

    // DHIS2 UID — user is selecting an item from a previous explore list
    if (/^[A-Za-z0-9]{11}$/.test(text.trim())) {
        return INTENT.ADD_THEMATIC
    }

    // Short reply after an assistant question: inherit the intent of the prior user turn.
    // Covers "Yes", "OK", "All chiefdoms", "Northern region" etc. following a clarification.
    const wordCount = text.trim().split(/\s+/).length
    if (wordCount <= 4 && history.length >= 2) {
        const lastAssistantMsg = [...history]
            .reverse()
            .find((m) => m.role === 'assistant')
        const lastAssistantText =
            typeof lastAssistantMsg?.content === 'string'
                ? lastAssistantMsg.content
                : ''
        if (lastAssistantText.includes('?')) {
            const lastUserMsg = [...history]
                .reverse()
                .find((m) => m.role === 'user' && typeof m.content === 'string')
            if (lastUserMsg) {
                const inherited = classifyIntent(lastUserMsg.content)
                // EXPLORE → ADD_THEMATIC: user is selecting an item from the explore results
                return inherited === INTENT.EXPLORE
                    ? INTENT.ADD_THEMATIC
                    : inherited
            }
        }
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
                'validate_periods',
                'search_data_items',
                'search_org_unit_group_sets',
                'update_layer',
            ]
        case INTENT.REMOVE:
            // list_layers is needed when the user says "that layer" or "this one" (deictic refs)
            return ['list_layers', 'remove_layer']
        case INTENT.EXPLORE:
            return ['search_data_items']
        case INTENT.COMPOUND:
            return [
                'list_layers',
                'remove_layer',
                'search_data_items',
                'resolve_org_units',
                'resolve_periods',
                'validate_periods',
                'search_org_unit_group_sets',
                'add_thematic_layer',
                'add_facility_layer',
                'add_org_unit_layer',
                'update_layer',
            ]
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
    if (COMMENT_PATTERNS.some((p) => p.test(text.trim()))) {
        return "Noted! Let me know what you'd like to add, edit, or remove on the map."
    }
    if (/analys[ei]|interpret|explain|insight|trend|pattern/i.test(text)) {
        return "I can add, edit, and remove map layers, but I can't analyse or interpret map data here. Try the interpretations panel for commentary."
    }
    if (
        /\bpatient\b|\bindividual\b|\bperson named\b|\btracked entit|\bline list\b/i.test(
            text
        )
    ) {
        return 'Individual-level and tracked entity data is not available through this assistant.'
    }
    if (
        /\b(which|what)\b.{1,60}\b(highest|lowest|most|fewest|least|greatest|smallest|worst|best|most affected)\b/i.test(
            text
        ) ||
        /\bhow\s+many\b/i.test(text)
    ) {
        return "I can add, edit, and remove map layers, but I can't answer data questions or rank areas. Add a layer to visualise the data and explore it on the map."
    }
    return null
}
