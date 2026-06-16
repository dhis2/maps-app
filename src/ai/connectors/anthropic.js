const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MAX_TOKENS = 1024

/**
 * @param {Object} opts
 * @param {string} opts.baseURL - Route URL, e.g. '/api/routes/ai-proxy/run'
 * @param {string} [opts.apiKey] - Only used in dev; in prod the key lives in the Route
 * @param {string} opts.model
 * @returns {import('./types.js').LLMConnector}
 */
export const makeAnthropic = ({ id, label, baseURL, apiKey, model }) => ({
    id,
    label,
    capabilities: {
        supportsTools: true,
        supportsStreaming: false, // SSE through DHIS2 Routes is unverified
        isLocal: false,
        maxContextTokens: 200000,
    },

    async chat({ messages, tools, signal }) {
        const body = {
            model,
            max_tokens: DEFAULT_MAX_TOKENS,
            messages: toAnthropicMessages(messages),
            ...(tools?.length && {
                tools: tools.map((t) => ({
                    name: t.name,
                    description: t.description,
                    input_schema: t.input_schema,
                })),
            }),
        }

        const resp = await fetch(`${baseURL}/v1/messages`, {
            method: 'POST',
            signal,
            headers: {
                'content-type': 'application/json',
                'anthropic-version': ANTHROPIC_VERSION,
                'anthropic-dangerous-direct-browser-access': 'true',
                ...(apiKey && { 'x-api-key': apiKey }),
            },
            body: JSON.stringify(body),
        })

        if (!resp.ok) {
            const err = await resp.text().catch(() => resp.statusText)
            throw new Error(`Anthropic API error ${resp.status}: ${err}`)
        }

        const data = await resp.json()
        const content = data.content ?? []

        return {
            text: content
                .filter((b) => b.type === 'text')
                .map((b) => b.text)
                .join(''),
            toolCalls: content
                .filter((b) => b.type === 'tool_use')
                .map((b) => ({ id: b.id, name: b.name, args: b.input })),
        }
    },
})

/** Normalise our message format to Anthropic's */
const toAnthropicMessages = (messages) =>
    messages.map((msg) => {
        if (typeof msg.content === 'string') {
            return { role: msg.role, content: msg.content }
        }
        if (Array.isArray(msg.content)) {
            return {
                role: 'user',
                content: msg.content.map((item) => ({
                    type: 'tool_result',
                    tool_use_id: item.tool_use_id,
                    content: item.content,
                })),
            }
        }
        return msg
    })
