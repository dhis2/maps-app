import i18n from '@dhis2/d2-i18n'
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
        if (/webgl/i.test(error?.message ?? '')) {
            throw new Error(
                i18n.t(
                    'Failed to initialize the map. Your system may not support WebGL. Verify compatibility here: {{url}}',
                    {
                        url: 'get.webgl.org',
                        nsSeparator: ';',
                    }
                ) +
                    '\n\n' +
                    (error.stack || error)
            )
        }
        throw error
    }
}

export {
    layerTypes,
    controlTypes,
    loadEarthEngineWorker,
    poleOfInaccessibility,
}

export default map
