/** @param {import('./types.js').Tool} tool */
const toOpenAITool = (tool) => ({
    type: 'function',
    function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
    },
})

/**
 * @param {Object} opts
 * @param {string} opts.baseURL - e.g. 'http://localhost:11434/v1' for Ollama
 * @param {string} [opts.apiKey]
 * @param {string} opts.model
 * @param {boolean} [opts.isLocal]
 * @returns {import('./types.js').LLMConnector}
 */
export const makeOpenAICompatible = ({
    id,
    label,
    baseURL,
    apiKey,
    model,
    isLocal = false,
}) => ({
    id,
    label,
    capabilities: {
        supportsTools: true,
        supportsStreaming: true,
        isLocal,
        maxContextTokens: 8192,
    },

    async chat({ messages, tools, responseSchema, signal }) {
        const body = {
            model,
            messages: messages.map(toOpenAIMessage),
            ...(tools?.length && { tools: tools.map(toOpenAITool) }),
            ...(responseSchema && {
                response_format: {
                    type: 'json_schema',
                    json_schema: { name: 'response', schema: responseSchema },
                },
            }),
        }

        const resp = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
            },
            body: JSON.stringify(body),
        })

        if (!resp.ok) {
            const err = await resp.text().catch(() => resp.statusText)
            throw new Error(
                `OpenAI-compatible API error ${resp.status}: ${err}`
            )
        }

        const data = await resp.json()
        const message = data.choices?.[0]?.message ?? {}

        return {
            text: message.content ?? '',
            toolCalls: (message.tool_calls ?? []).map((tc) => ({
                id: tc.id,
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments),
            })),
        }
    },
})

/** Normalise our message format to OpenAI's */
const toOpenAIMessage = (msg) => {
    if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content }
    }
    // tool results
    if (Array.isArray(msg.content)) {
        return {
            role: 'tool',
            tool_call_id: msg.content[0]?.tool_use_id,
            content: msg.content[0]?.content ?? '',
        }
    }
    return msg
}
