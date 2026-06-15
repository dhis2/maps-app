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
    const intent = classifyIntent(userText)
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

    // Build the active tool subset
    const activeToolNames = getToolsForIntent(intent)
    const activeTools = TOOL_SCHEMAS.filter((t) =>
        activeToolNames.includes(t.name)
    )

    // Build message list
    const messages = [...history, { role: 'user', content: userText }]

    const newMessages = [{ role: 'user', content: userText }]
    let reply = ''

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
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
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
        for (const tc of result.toolCalls) {
            console.log('[AI] → tool call:', tc.name, tc.args)
            onUpdate?.({ type: 'tool_call', name: tc.name, args: tc.args })
            const toolResult = await executeToolCall(toolRegistry, tc)
            const parsed = JSON.parse(toolResult.content)
            console.log('[AI] ← tool result:', tc.name, parsed)
            onUpdate?.({ type: 'tool_result', name: tc.name, result: parsed })
            toolResults.push(toolResult)
        }

        // Feed results back into the conversation
        const toolResultMessage = { role: 'user', content: toolResults }
        newMessages.push(toolResultMessage)
        messages.push(toolResultMessage)
    }

    return {
        history: [...history, ...newMessages],
        reply,
    }
}
