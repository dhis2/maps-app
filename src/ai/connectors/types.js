/**
 * @typedef {Object} Message
 * @property {'user'|'assistant'} role
 * @property {string|ToolResultContent[]} content
 */

/**
 * @typedef {Object} ToolResultContent
 * @property {'tool_result'} type
 * @property {string} tool_use_id
 * @property {string} content
 */

/**
 * @typedef {Object} Tool
 * @property {string} name
 * @property {string} description
 * @property {Object} input_schema - JSON Schema for the tool's arguments
 */

/**
 * @typedef {Object} ToolCall
 * @property {string} id
 * @property {string} name
 * @property {Object} args
 */

/**
 * @typedef {Object} ChatRequest
 * @property {Message[]} messages
 * @property {Tool[]} [tools]
 * @property {'auto'|'any'|'none'} [toolChoice]
 * @property {Object} [responseSchema] - JSON Schema for constrained decoding
 * @property {AbortSignal} [signal]
 */

/**
 * @typedef {Object} ChatResult
 * @property {string} text
 * @property {ToolCall[]} toolCalls
 */

/**
 * @typedef {Object} Capabilities
 * @property {boolean} supportsTools
 * @property {boolean} supportsStreaming
 * @property {boolean} isLocal
 * @property {number} maxContextTokens
 */

/**
 * @typedef {Object} LLMConnector
 * @property {(req: ChatRequest) => Promise<ChatResult>} chat
 * @property {Capabilities} capabilities
 * @property {string} id
 * @property {string} label
 */
