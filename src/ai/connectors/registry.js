import { makeAnthropic } from './anthropic.js'
import { makeDemoConnector } from './demo.js'
import { makeOpenAICompatible } from './openaiCompatible.js'

/**
 * Provider configurations are stored in the app's datastore under the key
 * 'aiProviders'. Shape: Array<ProviderConfig>
 *
 * @typedef {Object} ProviderConfig
 * @property {string} id
 * @property {string} label
 * @property {'openaiCompatible'|'anthropic'} type
 * @property {string} baseURL
 * @property {string} model
 * @property {boolean} [isLocal]
 * @property {boolean} [enabled]
 */

const demoConnector = makeDemoConnector()

/**
 * Build an LLMConnector from a ProviderConfig.
 * @param {ProviderConfig} config
 * @returns {import('./types.js').LLMConnector}
 */
export const buildConnector = (config) => {
    switch (config.type) {
        case 'openaiCompatible':
            return makeOpenAICompatible(config)
        case 'anthropic':
            return makeAnthropic(config)
        default:
            throw new Error(`Unknown provider type: ${config.type}`)
    }
}

/**
 * Build the ordered list of available connectors from provider configs,
 * always appending the demo connector at the end.
 * @param {ProviderConfig[]} configs
 * @returns {import('./types.js').LLMConnector[]}
 */
export const buildRegistry = (configs = []) => {
    const connectors = configs
        .filter((c) => c.enabled !== false)
        .map(buildConnector)
    return [...connectors, demoConnector]
}

/**
 * Select the active connector — first enabled real provider, or demo as fallback.
 * @param {import('./types.js').LLMConnector[]} registry
 * @param {string|null} [preferredId]
 * @returns {import('./types.js').LLMConnector}
 */
export const selectConnector = (registry, preferredId = null) => {
    if (preferredId) {
        const preferred = registry.find((c) => c.id === preferredId)
        if (preferred) {
            return preferred
        }
    }
    return registry[0] ?? demoConnector
}

export { demoConnector }
