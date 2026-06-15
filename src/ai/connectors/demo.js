import { DEMO_SCRIPTS, DEMO_FALLBACK_MESSAGE } from './demoScripts.js'

let stepCounter = 0
const nextId = () => `demo-tc-${++stepCounter}`

/**
 * Deterministic demo connector — implements LLMConnector without calling any model.
 * Matches user input against DEMO_SCRIPTS and returns scripted tool calls one at a time.
 * The real resolver tools and executor run against the live DHIS2 instance; only the
 * "LLM reasoning" step is replaced by this fixed plan.
 */
export const makeDemoConnector = () => ({
    id: 'demo',
    label: 'Demo (no model)',
    capabilities: {
        supportsTools: true,
        supportsStreaming: false,
        isLocal: true,
        maxContextTokens: Infinity,
    },

    async chat({ messages }) {
        // Find the LAST string-content user message — that is the current turn's query.
        // Messages from previous turns (prior conversation history) appear before it.
        const lastUserIdx = messages.reduce(
            (idx, m, i) =>
                m.role === 'user' && typeof m.content === 'string' ? i : idx,
            -1
        )
        const text = lastUserIdx >= 0 ? messages[lastUserIdx].content : ''

        let script = null
        let isRemoval = false
        for (const s of DEMO_SCRIPTS) {
            if (s.removeMatch?.test(text)) {
                script = s
                isRemoval = true
                break
            }
            if (s.match.test(text)) {
                script = s
                break
            }
        }
        console.log(
            '[AI][demo] user text:',
            text,
            '| matched script:',
            script?.label ?? 'none',
            '| isRemoval:',
            isRemoval
        )

        if (!script) {
            return { text: DEMO_FALLBACK_MESSAGE, toolCalls: [] }
        }

        // Only look at messages AFTER the current user message — earlier messages
        // belong to prior turns and must not count as "already done".
        const currentTurnMessages = messages.slice(lastUserIdx + 1)

        // Which tools have already been called (read from assistant messages)
        const completedToolNames =
            extractCompletedToolNames(currentTurnMessages)
        console.log('[AI][demo] completed tools:', completedToolNames)

        // Collect results from tool calls already executed
        const toolResults = extractToolResults(currentTurnMessages)
        console.log('[AI][demo] accumulated tool results:', toolResults)

        const steps = isRemoval ? script.removeSteps ?? [] : script.steps
        const nextStep = steps.find(
            (step) => !completedToolNames.includes(step.name)
        )

        if (!nextStep) {
            return {
                text: isRemoval
                    ? `Done! The layer has been removed from the map.`
                    : `Done! The ${script.label.toLowerCase()} has been added to the map.`,
                toolCalls: [],
            }
        }

        console.log('[AI][demo] next step:', nextStep.name)

        // Build resolved args for layer-adding steps using prior tool results
        const resolvedArgs = resolveArgs(nextStep, toolResults)
        console.log(
            '[AI][demo] resolved args for',
            nextStep.name,
            ':',
            resolvedArgs
        )

        if (resolvedArgs === null) {
            return {
                text: `I couldn't find a matching data item in this DHIS2 instance. Try a different search term or check available indicators.`,
                toolCalls: [],
            }
        }

        return {
            text: '',
            toolCalls: [
                { id: nextId(), name: nextStep.name, args: resolvedArgs },
            ],
        }
    },
})

/** Extract tool names already called from assistant messages in history */
const extractCompletedToolNames = (messages) => {
    const names = []
    for (const msg of messages) {
        if (msg.role === 'assistant' && Array.isArray(msg.toolCalls)) {
            for (const tc of msg.toolCalls) {
                names.push(tc.name)
            }
        }
    }
    return names
}

/**
 * Collect the parsed results of all completed tool calls.
 * Tool result messages have role:'user' with Array content of { tool_use_id, content } objects.
 * Assistant messages record which tool name each id belongs to.
 */
const extractToolResults = (messages) => {
    // Build a map from tool_use_id → tool name
    const idToName = {}
    for (const msg of messages) {
        if (msg.role === 'assistant' && Array.isArray(msg.toolCalls)) {
            for (const tc of msg.toolCalls) {
                idToName[tc.id] = tc.name
            }
        }
    }

    const results = {}
    for (const msg of messages) {
        if (msg.role === 'user' && Array.isArray(msg.content)) {
            for (const item of msg.content) {
                if (item.tool_use_id && item.content) {
                    const name = idToName[item.tool_use_id]
                    if (name) {
                        try {
                            results[name] = JSON.parse(item.content)
                        } catch {
                            results[name] = item.content
                        }
                    }
                }
            }
        }
    }
    return results
}

/**
 * Build resolved args for a step, substituting actual tool results for
 * the placeholder strings used in demoScripts.js.
 */
const resolveArgs = (step, toolResults) => {
    switch (step.name) {
        case 'add_thematic_layer': {
            const dataItemResult = toolResults['search_data_items']
            const orgUnitResult = toolResults['resolve_org_units']
            const periodResult = toolResults['resolve_periods']

            const firstCandidate = dataItemResult?.candidates?.[0]
            if (!firstCandidate) {
                // search_data_items found nothing — return a text message and stop
                return null // signals to chat() to return a fallback message
            }

            const dataItem = {
                id: firstCandidate.id,
                name: firstCandidate.displayName,
                dimensionItemType: firstCandidate.dimensionItemType,
            }
            const orgUnits = orgUnitResult?.items ?? step.args.orgUnits
            const periods = periodResult?.periods ?? step.args.periods

            return { ...step.args, dataItem, orgUnits, periods }
        }
        case 'add_facility_layer':
        case 'add_org_unit_layer': {
            const orgUnitResult = toolResults['resolve_org_units']
            // Fall back to empty array rather than the placeholder string
            const orgUnits = orgUnitResult?.items ?? []
            return { ...step.args, orgUnits }
        }
        default:
            return step.args
    }
}
