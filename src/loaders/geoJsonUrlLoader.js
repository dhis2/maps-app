import i18n from '@dhis2/d2-i18n'
import { parseLayerConfig } from '../util/external.js'
import { buildGeoJsonFeatures } from '../util/geojson.js'

const fetchData = async (url, engine, baseUrl) => {
    if (url.includes(baseUrl)) {
        // API route, use engine
        const routesIndex = url.indexOf('routes')
        if (routesIndex === -1) {
            throw new Error(`Invalid API route ${url}`)
        }

        return engine
            .query({
                geojson: {
                    resource: url.slice(routesIndex),
                },
            })
            .then(async (data) =>
                data.geojson instanceof Blob
                    ? JSON.parse(await data.geojson.text()) // TODO - remove once Blob fix implemented in app-runtime (LIBS-542)
                    : data.geojson
            )
            .catch((e) => {
                if (typeof e === 'object' && e.details?.message) {
                    if (
                        e.details.message.toLowerCase().includes('jwt expired')
                    ) {
                        throw new Error(
                            i18n.t(
                                'Authorization is no longer valid. Please contact your administrator.'
                            )
                        )
                    }
                    throw new Error(e.details.message)
                }

                throw new Error(e)
            })
    } else {
        // External route, use fetch
        return fetch(url)
            .then((response) => response.json())
            .catch((error) => {
                throw new Error(
                    i18n.t('Failed to load layer: {{error}}', {
                        error,
                        nsSeparator: '^^',
                    })
                )
            })
    }
}

const EMPTY_FEATURE_STYLE = {}
const geoJsonUrlLoader = async (layer, engine, baseUrl) => {
    const { config } = layer

    let newConfig
    let featureStyle
    // keep featureStyle property outside of config while in app
    if (typeof config === 'string') {
        // External layer is loaded in analytical object
        newConfig = await parseLayerConfig(config)
        featureStyle = { ...newConfig.featureStyle } || EMPTY_FEATURE_STYLE
        delete newConfig.featureStyle
    } else {
        newConfig = { ...config }
        featureStyle = layer.featureStyle || EMPTY_FEATURE_STYLE
    }

    let geoJson
    let error

    try {
        geoJson = await fetchData(newConfig.url, engine, baseUrl)
    } catch (message) {
        console.error(message)

        return {
            ...layer,
            name: newConfig.name, // TODO - will be fixed by DHIS2-16088
            config: newConfig,
            featureStyle,
            isLoaded: true, // technically dont need this line since already set in layer object
            isLoading: false, // technically dont need this line since already set in layer object
            isExpanded: true,
            isVisible: true,
            error: message,
        }
    }

    const legend = {
        title: newConfig.name,
        items: [
            {
                name: 'Feature',
                ...featureStyle,
                color: featureStyle.strokeColor,
                weight: featureStyle.weight,
            },
        ],
    }

    return {
        ...layer,
        name: newConfig.name, // TODO - will be fixed by DHIS2-16088
        legend,
        data: buildGeoJsonFeatures(geoJson),
        config: newConfig,
        featureStyle,
        isLoaded: true, // technically dont need this line since already set in layer object
        isLoading: false, // technically dont need this line since already set in layer object
        isExpanded: true,
        isVisible: true,
        error,
    }
}

export default geoJsonUrlLoader
