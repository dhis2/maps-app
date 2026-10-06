import i18n from '@dhis2/d2-i18n'
import { createErrorAlert } from '../util/layerAlerts.js'
import earthEngineLoader from './earthEngineLoader.js'
import eventLoader from './eventLoader.js'
import externalLoader from './externalLoader.js'
import facilityLoader from './facilityLoader.js'
import geoJsonUrlLoader from './geoJsonUrlLoader.js'
import orgUnitLoader from './orgUnitLoader.js'
import thematicLoader from './thematicLoader.js'
import trackedEntityLoader from './trackedEntityLoader.js'

const LOADERS = {
    earthEngine: earthEngineLoader,
    event: eventLoader,
    external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    thematic: thematicLoader,
    geoJsonUrl: geoJsonUrlLoader,
    trackedEntity: trackedEntityLoader,
}

// Loads any layer type, in the app and the plugin. Never throws: a layer
// always finishes loading, with an error alert if something went wrong.
export const loadLayer = async (config, context) => {
    try {
        const loader = LOADERS[config.layer]
        if (!loader) {
            throw new Error(`Unknown layer type: ${config.layer}`)
        }
        return await loader({ config, ...context })
    } catch (error) {
        console.error(error)
        return {
            ...config,
            name: config.name || i18n.t('Layer'),
            alerts: [createErrorAlert(error)],
            isLoaded: true,
            isLoading: false,
            isExpanded: true,
        }
    }
}
