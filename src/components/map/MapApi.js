import MapApi, {
    layerTypes,
    controlTypes,
    loadEarthEngineWorker,
    poleOfInaccessibility,
} from '@dhis2/maps-gl'
import getMapLocale from './mapLocale.js'

// Returns a new map instance
const map = (options) => {
    const baseUrl = process.env.DHIS2_BASE_URL
    const glyphs = `${baseUrl}/dhis-web-maps/fonts/{fontstack}/{range}.pbf`
    const div = document.createElement('div')

    div.className = 'dhis2-map'
    div.style.width = '100%'
    div.style.height = '100%'

    return new MapApi(div, {
        ...options,
        locale: getMapLocale(),
        glyphs,
    })
}

export {
    layerTypes,
    controlTypes,
    loadEarthEngineWorker,
    poleOfInaccessibility,
}

export default map
