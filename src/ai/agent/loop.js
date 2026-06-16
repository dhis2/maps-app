import { guardMessages } from '../egress/guard.js'
import { executeToolCall } from '../tools/executor.js'
import { TOOL_SCHEMAS } from '../tools/schemas.js'
import {
    classifyIntent,
    getDeclineMessage,
    getToolsForIntent,
} from './router.js'
import { INTENT, SYSTEM_PROMPT } from './systemPrompt.js'

const MAX_ITERATIONS = 8

/**
 * Run the agent loop for a single user turn.
 *
 * @param {Object} opts
 * @param {import('../connectors/types.js').LLMConnector} opts.connector
 * @param {import('../tools/executor.js').buildToolRegistry} opts.toolRegistry
 * @param {Object[]} opts.history - Previous messages in this conversation
 * @param {string} opts.userText - The user's new message
 * @param {Function} opts.onUpdate - Called with partial updates: { type, ... }
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{ history: Object[], reply: string }>}
 */
export const runAgentLoop = async ({
    connector,
    toolRegistry,
    history,
    userText,
    onUpdate,
    signal,
}) => {
    // Intent classification for tool subsetting
    const intent = classifyIntent(userText, history)
    console.log('[AI] intent:', intent, '| connector:', connector.id)

    // Fast decline — no LLM call needed
    if (intent === INTENT.DECLINE) {
        const msg =
            getDeclineMessage(userText) ??
            "That's not something I can help with here."
        onUpdate?.({ type: 'reply', text: msg })
        return {
            history: [
                ...history,
                { role: 'user', content: userText },
                { role: 'assistant', content: msg },
            ],
            reply: msg,
        }
    }

    // Fast remove — bypass the LLM to avoid spurious confirmation prompts
    if (intent === INTENT.REMOVE) {
        const namePattern = userText
            .replace(
                /\b(remove|delete|hide|clear|drop|get rid of|the|a|an|my|this|that|it|one|current|latest|all|everything|layers?|map|thematic|choropleth|bubble)\b/gi,
                ' '
            )
            .replace(/\s+/g, ' ')
            .trim()

        const removeFn = toolRegistry['remove_layer']
        const wordCount = namePattern.split(/\s+/).length

        // No specific name left after stripping — handle programmatically
        if (removeFn && !namePattern) {
            onUpdate?.({ type: 'thinking' })
            const listFn = toolRegistry['list_layers']
            const layerList = listFn ? await listFn({}) : { layers: [] }
            const layers = layerList.layers ?? []

            // "remove all/every/everything"
            if (/\b(all|every|everything)\b/i.test(userText)) {
                const msg = layers.length
                    ? `Done — I've removed all layers.`
                    : 'There are no layers to remove.'
                for (const layer of layers) {
                    await removeFn({ layerId: layer.id })
                }
                onUpdate?.({ type: 'reply', text: msg })
                return {
                    history: [
                        ...history,
                        { role: 'user', content: userText },
                        { role: 'assistant', content: msg },
                    ],
                    reply: msg,
                }
            }

            // Deictic / ambiguous reference with exactly one layer → remove it
            if (layers.length === 1) {
                const result = await removeFn({ layerId: layers[0].id })
                const msg = result.success
                    ? `Done — I've removed the layer.`
                    : result.message ?? 'Failed to remove the layer.'
                onUpdate?.({ type: 'reply', text: msg })
                return {
                    history: [
                        ...history,
                        { role: 'user', content: userText },
                        { role: 'assistant', content: msg },
                    ],
                    reply: msg,
                }
            }

            // Zero layers
            if (layers.length === 0) {
                const msg = 'There are no layers to remove.'
                onUpdate?.({ type: 'reply', text: msg })
                return {
                    history: [
                        ...history,
                        { role: 'user', content: userText },
                        { role: 'assistant', content: msg },
                    ],
                    reply: msg,
                }
            }

            // Multiple layers — fall through to LLM with list pre-fetched (it knows the ids)
        }

        // Skip fast-remove for compound messages (e.g. "remove X then add Y") —
        // a long pattern won't match any layer name.
        if (removeFn && namePattern && wordCount <= 5) {
            onUpdate?.({ type: 'thinking' })
            const result = await removeFn({ namePattern })
            console.log('[AI] fast remove result:', result)
            const msg = result.success
                ? `Done — I've removed the layer.`
                : result.message ?? 'No matching layer found.'
            onUpdate?.({ type: 'reply', text: msg })
            return {
                history: [
                    ...history,
                    { role: 'user', content: userText },
                    { role: 'assistant', content: msg },
                ],
                reply: msg,
            }
        }
    }

    // COMPOUND: split into sequential remove + add phases so the 7B model
    // never sees more than ~4 tools at once.
    if (intent === INTENT.COMPOUND) {
        // Split on the first "and/then/," separating the remove half from the add half
        const compoundSplit = userText.match(/^(.+?)\s+(?:and|then|,)\s+(.+)$/i)
        if (compoundSplit) {
            const [, removePart, addPart] = compoundSplit

            // Phase 1: fast-remove (same stripping logic as the REMOVE path)
            const removePattern = removePart
                .replace(
                    /\b(remove|delete|hide|clear|drop|get rid of|the|a|an|my|this|that|it|one|current|latest|all|everything|layers?|map|thematic|choropleth|bubble)\b/gi,
                    ' '
                )
                .replace(/\s+/g, ' ')
                .trim()
            const removeFn = toolRegistry['remove_layer']
            let removeMsg = ''
            const removeWordCount = removePattern.split(/\s+/).length
            if (removeFn && removePattern && removeWordCount <= 5) {
                onUpdate?.({ type: 'thinking' })
                const removeResult = await removeFn({
                    namePattern: removePattern,
                })
                console.log('[AI] compound remove result:', removeResult)
                removeMsg = removeResult.success
                    ? 'Done — removed the layer.'
                    : removeResult.message ?? 'No matching layer found.'
            }

            // Phase 2: run the add loop recursively with just the add sub-request
            const addResult = await runAgentLoop({
                connector,
                toolRegistry,
                history: [
                    ...history,
                    { role: 'user', content: userText },
                    { role: 'assistant', content: removeMsg },
                ],
                userText: addPart,
                onUpdate,
                signal,
            })

            // Build a clean combined reply
            const addSuccess = addResult.reply?.startsWith('Done')
            const removeSuccess = removeMsg === 'Done — removed the layer.'
            let combinedReply
            if (removeSuccess && addSuccess) {
                combinedReply = `Done — I've removed the layer and added the new one.`
            } else if (removeMsg) {
                combinedReply = `${removeMsg} ${addResult.reply}`
            } else {
                combinedReply = addResult.reply
            }
            onUpdate?.({ type: 'reply', text: combinedReply })
            return {
                history: [
                    ...history,
                    { role: 'user', content: userText },
                    { role: 'assistant', content: combinedReply },
                ],
                reply: combinedReply,
            }
        }
        // Fall through to the main loop if the pattern didn't match
    }

    // Build the active tool subset
    const activeToolNames = getToolsForIntent(intent)
    const activeTools = TOOL_SCHEMAS.filter((t) =>
        activeToolNames.includes(t.name)
    )

    // For EDIT intent, pre-fetch the layer list and append it to the system prompt.
    // This lets the model reference layer ids directly without needing a list_layers tool call.
    let systemContent = SYSTEM_PROMPT
    let hadLayersForEdit = false
    let prefetchedLayers = [] // cached from EDIT pre-fetch to reuse in fast paths
    if (intent === INTENT.EDIT) {
        const listLayersFn = toolRegistry['list_layers']
        if (listLayersFn) {
            try {
                const layerResult = await listLayersFn({})
                if (layerResult?.layers?.length) {
                    hadLayersForEdit = true
                    prefetchedLayers = layerResult.layers
                    const layerSummary = layerResult.layers
                        .map((l) => `  - layerId="${l.id}" (${l.summary})`)
                        .join('\n')
                    systemContent = `${SYSTEM_PROMPT}\n\nCurrent map layers (for update_layer calls):\n${layerSummary}\nCall update_layer with one of these layerIds. For map type changes (choropleth↔bubble) use changes: { thematicMapType: 'BUBBLE' } or { thematicMapType: 'CHOROPLETH' } — no resolve step needed. For period or org unit changes, resolve first then call update_layer.`
                } else {
                    // No layers — skip LLM entirely
                    const msg =
                        'There are no layers on the map to edit. Add a layer first.'
                    onUpdate?.({ type: 'reply', text: msg })
                    return {
                        history: [
                            ...history,
                            { role: 'user', content: userText },
                            { role: 'assistant', content: msg },
                        ],
                        reply: msg,
                    }
                }
            } catch (_) {
                // ignore — model will call list_layers itself if needed
            }
        }
    }

    // EDIT fast path: map type change (choropleth ↔ bubble).
    // Detects "bubble" / "choropleth" in user text and applies directly — no LLM call.
    if (intent === INTENT.EDIT && hadLayersForEdit) {
        const wantsBubble = /\bbubble\b/i.test(userText)
        const wantsChoropleth = /\bchoropleth\b/i.test(userText)
        if (wantsBubble || wantsChoropleth) {
            const targetType = wantsBubble ? 'BUBBLE' : 'CHOROPLETH'
            const updateFn = toolRegistry['update_layer']
            if (updateFn) {
                // Use prefetched layer list; fall back to thematic-only filtering
                const thematicLayers = prefetchedLayers.filter((l) => {
                    const s = (l.summary ?? '').toLowerCase()
                    return (
                        l.type === 'thematic' ||
                        s.includes('choropleth') ||
                        s.includes('bubble') ||
                        s.includes('thematic')
                    )
                })
                const allLayers = thematicLayers.length
                    ? thematicLayers
                    : prefetchedLayers
                // Pick the best match: only one → use it; multiple → match name words
                let targetLayer = allLayers.length === 1 ? allLayers[0] : null
                if (!targetLayer && allLayers.length > 1) {
                    const words = userText
                        .toLowerCase()
                        .split(/\s+/)
                        .filter(
                            (w) =>
                                w.length > 3 &&
                                !/bubble|choropleth|show|make|switch|convert|change|layer|map/i.test(
                                    w
                                )
                        )
                    targetLayer =
                        allLayers.find((l) => {
                            const name = (l.summary ?? '').toLowerCase()
                            return words.some((w) => name.includes(w))
                        }) ?? allLayers[0]
                }
                if (targetLayer) {
                    onUpdate?.({ type: 'thinking' })
                    onUpdate?.({
                        type: 'tool_call',
                        name: 'update_layer',
                        args: {
                            layerId: targetLayer.id,
                            changes: { thematicMapType: targetType },
                        },
                    })
                    const result = await updateFn({
                        layerId: targetLayer.id,
                        changes: { thematicMapType: targetType },
                    })
                    onUpdate?.({
                        type: 'tool_result',
                        name: 'update_layer',
                        result,
                    })
                    const msg = result.success
                        ? `Done — I've switched the layer to ${
                              targetType === 'BUBBLE'
                                  ? 'bubble map'
                                  : 'choropleth'
                          }.`
                        : result.message ?? 'Failed to update the layer.'
                    onUpdate?.({ type: 'reply', text: msg })
                    return {
                        history: [
                            ...history,
                            { role: 'user', content: userText },
                            { role: 'assistant', content: msg },
                        ],
                        reply: msg,
                    }
                }
            }
        }
    }

    // Compress + trim history to prevent 7B model context overload.
    // Each turn produces 4 messages (user, assistant+toolcalls, tool results, assistant reply).
    // Strip tool-call scaffolding (array-content tool results and empty assistant tool-call entries)
    // so the model only sees user questions + final assistant replies from prior turns.
    const MAX_HISTORY_TURNS = 4
    const trimHistory = (hist) => {
        const compressed = hist.filter(
            (m) => typeof m.content === 'string' && m.content.trim()
        )
        const userMsgIndices = compressed
            .map((m, i) => (m.role === 'user' ? i : -1))
            .filter((i) => i >= 0)
        if (userMsgIndices.length <= MAX_HISTORY_TURNS) {
            return compressed
        }
        return compressed.slice(
            userMsgIndices[userMsgIndices.length - MAX_HISTORY_TURNS]
        )
    }

    // Build message list
    const messages = [
        ...trimHistory(history),
        { role: 'user', content: userText },
    ]

    const newMessages = [{ role: 'user', content: userText }]
    let reply = ''

    // Track whether resolve tools / layer operations were called during the loop
    let resolveToolsCalled = false
    let updateLayerCalled = false
    let updateLayerSucceeded = false
    let anyLayerAdded = false
    let searchDirectiveInjected = false
    // Cache the last successfully resolved values for programmatic recovery
    let lastResolvedDataItem = null
    let lastResolvedOrgUnits = null
    let lastResolvedPeriods = null

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        if (signal?.aborted) {
            break
        }

        // Egress guard: assert no analytics values in outbound messages
        guardMessages(messages)

        console.log(
            `[AI] iteration ${i + 1}/${MAX_ITERATIONS}, messages:`,
            messages.length
        )
        onUpdate?.({ type: 'thinking' })

        const result = await connector.chat({
            messages: [{ role: 'system', content: systemContent }, ...messages],
            tools: activeTools,
            signal,
        })

        console.log(
            '[AI] connector response — text:',
            result.text || '(none)',
            '| toolCalls:',
            result.toolCalls?.map((t) => t.name)
        )

        if (result.text) {
            reply = result.text
            onUpdate?.({ type: 'text', text: result.text })
        }

        if (!result.toolCalls?.length) {
            // No more tool calls — we're done
            console.log('[AI] done (no more tool calls)')
            newMessages.push({
                role: 'assistant',
                content: result.text,
                toolCalls: [],
            })
            break
        }

        // Record assistant message with tool calls — keep toolCalls so demo connector can track progress
        const assistantMsg = {
            role: 'assistant',
            content: result.text,
            toolCalls: result.toolCalls,
        }
        newMessages.push(assistantMsg)
        messages.push(assistantMsg)

        // Execute each tool call
        const toolResults = []
        let layerAdded = false
        for (const tc of result.toolCalls) {
            console.log('[AI] → tool call:', tc.name, tc.args)
            onUpdate?.({ type: 'tool_call', name: tc.name, args: tc.args })
            const toolResult = await executeToolCall(toolRegistry, tc)
            const parsed = JSON.parse(toolResult.content)
            console.log('[AI] ← tool result:', tc.name, parsed)
            onUpdate?.({ type: 'tool_result', name: tc.name, result: parsed })
            toolResults.push(toolResult)
            if (
                [
                    'resolve_org_units',
                    'resolve_periods',
                    'search_data_items',
                ].includes(tc.name)
            ) {
                resolveToolsCalled = true
            }
            if (tc.name === 'update_layer') {
                updateLayerCalled = true
                if (parsed.success) {
                    updateLayerSucceeded = true
                }
            }
            if (
                tc.name === 'search_data_items' &&
                parsed.found &&
                parsed.candidates?.[0]?.id
            ) {
                lastResolvedDataItem = parsed.candidates[0]
            }
            if (
                tc.name === 'resolve_org_units' &&
                parsed.resolved &&
                parsed.items?.length
            ) {
                lastResolvedOrgUnits = parsed.items
            }
            if (
                tc.name === 'resolve_periods' &&
                parsed.resolved &&
                parsed.periods?.length
            ) {
                lastResolvedPeriods = parsed.periods
            }
            if (
                [
                    'add_thematic_layer',
                    'add_facility_layer',
                    'add_org_unit_layer',
                ].includes(tc.name) &&
                parsed.success
            ) {
                layerAdded = true
                anyLayerAdded = true
            }
        }

        // Feed results back into the conversation
        const toolResultMessage = { role: 'user', content: toolResults }
        newMessages.push(toolResultMessage)
        messages.push(toolResultMessage)

        // After search_data_items on an ADD intent: if all values are already resolved
        // in this same iteration (model made parallel calls), complete programmatically.
        // This eliminates the wasted iterations where the model retries with wrong args.
        if (
            !searchDirectiveInjected &&
            intent === INTENT.ADD_THEMATIC &&
            lastResolvedDataItem &&
            lastResolvedOrgUnits &&
            lastResolvedPeriods &&
            !layerAdded
        ) {
            searchDirectiveInjected = true
            const addFn = toolRegistry['add_thematic_layer']
            if (addFn) {
                const earlyAddArgs = {
                    dataItem: {
                        id: lastResolvedDataItem.id,
                        name:
                            lastResolvedDataItem.displayName ??
                            lastResolvedDataItem.name ??
                            lastResolvedDataItem.id,
                        dimensionItemType:
                            lastResolvedDataItem.dimensionItemType,
                    },
                    orgUnits: lastResolvedOrgUnits,
                    periods: lastResolvedPeriods,
                }
                console.log(
                    '[AI] early add (all resolved in same iter):',
                    earlyAddArgs
                )
                onUpdate?.({
                    type: 'tool_call',
                    name: 'add_thematic_layer',
                    args: earlyAddArgs,
                })
                const earlyResult = await addFn(earlyAddArgs)
                onUpdate?.({
                    type: 'tool_result',
                    name: 'add_thematic_layer',
                    result: earlyResult,
                })
                if (earlyResult.success) {
                    layerAdded = true
                    anyLayerAdded = true
                }
            }
        } else if (
            !searchDirectiveInjected &&
            [
                INTENT.ADD_THEMATIC,
                INTENT.ADD_FACILITY,
                INTENT.ADD_ORG_UNIT,
            ].includes(intent) &&
            lastResolvedDataItem &&
            !layerAdded
        ) {
            // Partial resolution — inject directive to tell the model what's still needed
            searchDirectiveInjected = true
            const PERIOD_RE =
                /\b(this year|last year|this quarter|last quarter|last \d+ years?|last \d+ months?|last \d+ weeks?|this month|last month|\d{4}Q[1-4]|\d{4})\b/i
            const OU_RE =
                /\b(district|chiefdom|region|province|national|facility|level)\b/i
            const recentUserTexts = [
                userText,
                ...[...history]
                    .filter(
                        (m) =>
                            m.role === 'user' && typeof m.content === 'string'
                    )
                    .slice(-4)
                    .map((m) => m.content),
            ]
            const periodHint =
                recentUserTexts
                    .map((t) => t.match(PERIOD_RE)?.[0])
                    .find(Boolean) ?? 'this year'
            const orgUnitHint =
                recentUserTexts.map((t) => t.match(OU_RE)?.[1]).find(Boolean) ??
                'all districts'
            const needsOU = !lastResolvedOrgUnits
            const needsPeriod = !lastResolvedPeriods
            const steps = [
                needsOU && `resolve_org_units with "${orgUnitHint}"`,
                needsPeriod && `resolve_periods with "${periodHint}"`,
            ]
                .filter(Boolean)
                .join(' and ')
            messages.push({
                role: 'user',
                content: `Data item found (id="${lastResolvedDataItem.id}"). Do NOT output text. Call ${steps}, then immediately call add_thematic_layer.`,
            })
        }

        // Stop after a successful update_layer — prevents the model from echoing garbage on the next iteration
        if (updateLayerSucceeded) {
            if (!reply || /^\s*update_layer\s*\{/.test(reply)) {
                reply = `Done — I've updated the layer.`
            }
            const last = newMessages.at(-1)
            if (last?.role === 'assistant' && !last.content?.trim()) {
                last.content = reply
            } else {
                newMessages.push({ role: 'assistant', content: reply })
            }
            onUpdate?.({ type: 'reply', text: reply })
            break
        }

        // Stop after a successful layer add — prevents duplicate layers from retry loops
        if (layerAdded) {
            if (!reply) {
                reply = `Done — I've added the layer.`
            }
            // Guarantee the reply text appears in the returned history (UI reads history, not reply)
            const last = newMessages.at(-1)
            if (last?.role === 'assistant' && !last.content?.trim()) {
                last.content = reply
            } else {
                newMessages.push({ role: 'assistant', content: reply })
            }
            break
        }
    }

    // If update_layer was called but the model produced no reply text, use a default.
    if (updateLayerCalled && !reply) {
        reply = `Done — I've updated the layer.`
        const last = newMessages.at(-1)
        if (last?.role === 'assistant' && !last.content?.trim()) {
            last.content = reply
        } else {
            newMessages.push({ role: 'assistant', content: reply })
        }
    }

    // EDIT recovery: model did not call update_layer despite having layers available.
    // Covers two cases: (a) resolve tools called but update_layer skipped, (b) no
    // tools called at all (e.g. thematicMapType change needs no resolve step).
    // Guard: only fire when layers were pre-injected; skip if model asked a genuine clarification.
    // A genuine clarification asks for a specific DHIS2 value (district, period, layer name).
    // "I wasn't sure what to do" / "Could you rephrase?" are confusion responses, not clarifications.
    const modelIsConfused =
        /I wasn't sure|I'm not sure|I couldn't|couldn't determine|try rephrasing|please rephrase|I don't understand|I'm unable|unable to/i.test(
            reply
        )
    const modelAskedClarification =
        !modelIsConfused &&
        reply.includes('?') &&
        /\b(which|what)\b.{0,40}\b(district|region|level|period|year|quarter|layer|indicator|data element|org unit)\b/i.test(
            reply
        )
    if (
        intent === INTENT.EDIT &&
        hadLayersForEdit &&
        !updateLayerCalled &&
        !modelAskedClarification
    ) {
        console.log(
            '[AI] edit recovery — resolveToolsCalled:',
            resolveToolsCalled,
            '| lastResolvedPeriods:',
            lastResolvedPeriods,
            '| lastResolvedOrgUnits:',
            lastResolvedOrgUnits
        )

        // --- Programmatic recovery (preferred): use cached resolved values directly.
        // Avoids asking the LLM again, which often calls resolve tools it can't execute
        // in recovery context, or passes wrong IDs.
        const updateFn = toolRegistry['update_layer']
        if (updateFn && prefetchedLayers.length) {
            // If resolve tools ran but model stalled without update, try to resolve
            // any missing values programmatically before calling update.
            if (!lastResolvedPeriods) {
                // Only scan the current user message — scanning history picks up stale periods
                // (e.g. the original "last year" from when the layer was added, rather than the
                // "last 5 years" set in a subsequent edit). If the user didn't mention a period
                // in this turn, leave it null so update_layer preserves the existing period.
                const PERIOD_RE =
                    /\b(this year|last year|this quarter|last quarter|last \d+ years?|last \d+ months?|last \d+ weeks?|this month|last month|\d{4}Q[1-4]|\d{4})\b/i
                const periodDesc = userText.match(PERIOD_RE)?.[0]
                if (periodDesc) {
                    try {
                        const resolveFn = toolRegistry['resolve_periods']
                        const pr = resolveFn
                            ? await resolveFn({ description: periodDesc })
                            : null
                        if (pr?.resolved && pr.periods?.length) {
                            lastResolvedPeriods = pr.periods
                        }
                    } catch (_) {}
                }
            }
            // Always re-resolve from current userText — overrides model hallucinations like
            // passing "by district, by chiefdom" when user only asked for one level.
            // Fall back to history only if userText has no OU keyword and model didn't resolve.
            {
                const OU_RE =
                    /\b(all\s+)?(districts?|chiefdoms?|regions?|provinces?|national|facilities?)\b/i
                const ouDescCurrent = userText.match(OU_RE)?.[0]
                if (ouDescCurrent) {
                    try {
                        const resolveFn = toolRegistry['resolve_org_units']
                        const or = resolveFn
                            ? await resolveFn({ description: ouDescCurrent })
                            : null
                        if (or?.resolved && or.items?.length) {
                            lastResolvedOrgUnits = or.items
                        }
                    } catch (_) {}
                } else if (!lastResolvedOrgUnits) {
                    const historyTexts = [...history]
                        .filter(
                            (m) =>
                                m.role === 'user' &&
                                typeof m.content === 'string'
                        )
                        .slice(-4)
                        .map((m) => m.content)
                    const ouDescHistory = historyTexts
                        .map((t) => t.match(OU_RE)?.[0])
                        .find(Boolean)
                    if (ouDescHistory) {
                        try {
                            const resolveFn = toolRegistry['resolve_org_units']
                            const or = resolveFn
                                ? await resolveFn({
                                      description: ouDescHistory,
                                  })
                                : null
                            if (or?.resolved && or.items?.length) {
                                lastResolvedOrgUnits = or.items
                            }
                        } catch (_) {}
                    }
                }
            }

            const changes = {}
            if (lastResolvedPeriods?.length) {
                changes.periods = lastResolvedPeriods
            }
            if (lastResolvedOrgUnits?.length) {
                changes.orgUnits = lastResolvedOrgUnits
            }

            if (Object.keys(changes).length) {
                const targetLayer = prefetchedLayers[0]
                console.log(
                    '[AI] edit recovery (programmatic): calling update_layer',
                    targetLayer.id,
                    changes
                )
                onUpdate?.({ type: 'thinking' })
                onUpdate?.({
                    type: 'tool_call',
                    name: 'update_layer',
                    args: { layerId: targetLayer.id, changes },
                })
                const result = await updateFn({
                    layerId: targetLayer.id,
                    changes,
                })
                onUpdate?.({
                    type: 'tool_result',
                    name: 'update_layer',
                    result,
                })
                if (result.success) {
                    reply = `Done — I've updated the layer.`
                    const last = newMessages.at(-1)
                    if (last?.role === 'assistant') {
                        last.content = reply
                    } else {
                        newMessages.push({ role: 'assistant', content: reply })
                    }
                    onUpdate?.({ type: 'reply', text: reply })
                }
                // Either way, don't fall through to LLM recovery — we tried.
            } else {
                // No cached values and couldn't extract from text — fall back to LLM recovery.
                console.log(
                    '[AI] edit recovery (LLM fallback): no cached resolved values'
                )
                const layerIdHint =
                    prefetchedLayers[0]?.id ?? '(see system context)'
                const correctionMsg = `CORRECTION: You did not call update_layer. The user wants: "${userText}". LayerId="${layerIdHint}". Call resolve_periods or resolve_org_units as needed, then call update_layer. Do not output text before calling the tools.`
                messages.push({ role: 'user', content: correctionMsg })
                onUpdate?.({ type: 'thinking' })
                const recoveryResult = await connector.chat({
                    messages: [
                        { role: 'system', content: systemContent },
                        ...messages,
                    ],
                    tools: activeTools,
                    signal,
                })
                console.log(
                    '[AI] edit recovery LLM — toolCalls:',
                    recoveryResult.toolCalls?.map((t) => t.name)
                )
                if (recoveryResult.toolCalls?.length) {
                    for (const tc of recoveryResult.toolCalls) {
                        if (tc.name === 'update_layer') {
                            onUpdate?.({
                                type: 'tool_call',
                                name: tc.name,
                                args: tc.args,
                            })
                            const toolResult = await executeToolCall(
                                toolRegistry,
                                tc
                            )
                            const parsed = JSON.parse(toolResult.content)
                            onUpdate?.({
                                type: 'tool_result',
                                name: tc.name,
                                result: parsed,
                            })
                            if (parsed.success) {
                                reply =
                                    recoveryResult.text?.trim() ||
                                    `Done — I've updated the layer.`
                                const last = newMessages.at(-1)
                                if (last?.role === 'assistant') {
                                    last.content = reply
                                } else {
                                    newMessages.push({
                                        role: 'assistant',
                                        content: reply,
                                    })
                                }
                                onUpdate?.({ type: 'reply', text: reply })
                            }
                        }
                    }
                }
            }
        }
    }

    // ADD recovery: model resolved some values but did not add the layer.
    // Bypass the LLM entirely — complete the operation programmatically using the
    // values cached during the main loop. This avoids confusing the 7B model with
    // another LLM iteration after it has already stalled.
    if (
        [
            INTENT.ADD_THEMATIC,
            INTENT.ADD_FACILITY,
            INTENT.ADD_ORG_UNIT,
        ].includes(intent) &&
        resolveToolsCalled &&
        !anyLayerAdded
    ) {
        console.log(
            '[AI] add recovery: completing programmatically with cached resolved values'
        )
        try {
            // If data item wasn't resolved (model skipped search_data_items), search now from user text
            if (!lastResolvedDataItem && intent === INTENT.ADD_THEMATIC) {
                const searchFn = toolRegistry['search_data_items']
                if (searchFn) {
                    const searchQuery = userText
                        .replace(
                            /\b(show|display|add|map|layer|by|for|in|at|on|the|a|an|all|this|last|next|year|month|quarter|week|district|region|province|national|chiefdom|facility|boundaries)\b/gi,
                            ' '
                        )
                        .replace(/\s+/g, ' ')
                        .trim()
                    if (searchQuery) {
                        console.log(
                            '[AI] add recovery: searching for data item with query:',
                            searchQuery
                        )
                        const searchResult = await searchFn({
                            query: searchQuery,
                        })
                        if (
                            searchResult.found &&
                            searchResult.candidates?.[0]?.id
                        ) {
                            lastResolvedDataItem = searchResult.candidates[0]
                            console.log(
                                '[AI] add recovery: found data item:',
                                lastResolvedDataItem
                            )
                        }
                    }
                }
            }

            // Resolve periods if not already done (extract from user text)
            if (!lastResolvedPeriods && intent === INTENT.ADD_THEMATIC) {
                const resolvePeriodsFn = toolRegistry['resolve_periods']
                if (resolvePeriodsFn) {
                    const periodsResult = await resolvePeriodsFn({
                        description: userText,
                    })
                    if (
                        periodsResult.resolved &&
                        periodsResult.periods?.length
                    ) {
                        lastResolvedPeriods = periodsResult.periods
                        console.log(
                            '[AI] add recovery: resolved periods from user text:',
                            lastResolvedPeriods
                        )
                    }
                }
            }

            const addFnName =
                intent === INTENT.ADD_THEMATIC
                    ? 'add_thematic_layer'
                    : intent === INTENT.ADD_FACILITY
                    ? 'add_facility_layer'
                    : 'add_org_unit_layer'
            const addFn = toolRegistry[addFnName]

            if (addFn && lastResolvedOrgUnits) {
                let addArgs
                if (
                    intent === INTENT.ADD_THEMATIC &&
                    lastResolvedDataItem &&
                    lastResolvedPeriods
                ) {
                    addArgs = {
                        dataItem: {
                            id: lastResolvedDataItem.id,
                            name:
                                lastResolvedDataItem.displayName ??
                                lastResolvedDataItem.name ??
                                lastResolvedDataItem.id,
                            dimensionItemType:
                                lastResolvedDataItem.dimensionItemType,
                        },
                        orgUnits: lastResolvedOrgUnits,
                        periods: lastResolvedPeriods,
                    }
                } else if (intent !== INTENT.ADD_THEMATIC) {
                    addArgs = { orgUnits: lastResolvedOrgUnits }
                }

                if (addArgs) {
                    console.log(
                        '[AI] add recovery → calling',
                        addFnName,
                        addArgs
                    )
                    onUpdate?.({
                        type: 'tool_call',
                        name: addFnName,
                        args: addArgs,
                    })
                    const addResult = await addFn(addArgs)
                    console.log('[AI] add recovery ← result:', addResult)
                    onUpdate?.({
                        type: 'tool_result',
                        name: addFnName,
                        result: addResult,
                    })
                    if (addResult.success) {
                        reply = `Done — I've added the layer.`
                        for (let j = newMessages.length - 1; j >= 0; j--) {
                            if (newMessages[j].role === 'assistant') {
                                newMessages[j] = {
                                    role: 'assistant',
                                    content: reply,
                                }
                                break
                            }
                        }
                        onUpdate?.({ type: 'reply', text: reply })
                    }
                }
            }
        } catch (e) {
            console.warn('[AI] add recovery failed:', e)
        }
    }

    // Guard against empty reply (model returned no text and no tool calls)
    if (!reply) {
        reply = "I wasn't sure what to do with that. Could you try rephrasing?"
        const last = newMessages.at(-1)
        if (last?.role === 'assistant' && !last.content) {
            last.content = reply
        } else {
            newMessages.push({ role: 'assistant', content: reply })
        }
    }

    return {
        history: [...history, ...newMessages],
        reply,
    }
}
