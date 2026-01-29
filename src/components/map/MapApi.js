import MapApi, {
    layerTypes,
    controlTypes,
    loadEarthEngineWorker,
    poleOfInaccessibility,
} from '@dhis2/maps-gl'
import getMapLocale from './mapLocale.js'

// Returns a new map instance
const map = (options) => {
    const glyphs = `${options.baseUrl}/dhis-web-maps/fonts/{fontstack}/{range}.pbf`
    const div = document.createElement('div')

    div.className = 'dhis2-map'
    div.style.width = '100%'
    div.style.height = '100%'

    try {
        return new MapApi(div, {
            ...options,
            locale: getMapLocale(),
            glyphs,
        })
    } catch (error) {
        const wrappedError = new Error(
            'Failed to initialize the map. Your system may not support WebGL. Verify compatibility here: https://get.webgl.org/\n\n' +
                (error.stack || error)
        )
        throw wrappedError
    }
}

export {
    layerTypes,
    controlTypes,
    loadEarthEngineWorker,
    poleOfInaccessibility,
}

export default map
