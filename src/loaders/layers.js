import earthEngineLoader from './earthEngineLoader.js'
import eventLoader from './eventLoader.js'
import externalLoader from './externalLoader.js'
import facilityLoader from './facilityLoader.js'
import orgUnitLoader from './orgUnitLoader.js'
import thematicLoader from './thematicLoader.js'
import trackedEntityLoader from './trackedEntityLoader.js'

const layerType = {
    event: eventLoader,
    trackedEntity: trackedEntityLoader,
    facility: facilityLoader,
    thematic: thematicLoader,
    orgUnit: orgUnitLoader,
    earthEngine: earthEngineLoader,
    external: externalLoader,
}

export const fetchLayer = (config) => {
    const Loader = layerType[config.layer]

    if (Loader) {
        return Loader({
            ...config,
            editCounter:
                config.editCounter !== undefined ? config.editCounter + 1 : 0,
        })
    } else {
        console.log('Unknown layer type', config.layer, config)
    }
}
