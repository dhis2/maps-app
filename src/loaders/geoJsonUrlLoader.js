import i18n from '@dhis2/d2-i18n'
import { parseLayerConfig } from '../util/external.js'
import { buildGeoJsonFeatures } from '../util/geojson.js'

const fetchData = async (url, engine, instanceBaseUrl) => {
    if (url.includes(instanceBaseUrl)) {
        // API route, use engine
        const routesIndex = url.indexOf('routes')
        if (routesIndex === -1) {
            throw new Error(i18n.t('Url to geojson is invalid.'))
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
                            i18n.t('Layer authorization is no longer valid.')
                        )
                    } else if (
                        e.details.message.toLowerCase().includes('not found')
                    ) {
                        throw new Error(i18n.t('Url to geojson was not found.'))
                    }

                    throw new Error(e.details.message)
                }

                throw new Error(e)
            })
    } else {
        // External route, use fetch
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(i18n.t('Url to geojson was not found.'))
                    }
                    if (response.status === 400) {
                        throw new Error(
                            i18n.t('The request for geojson was invalid.')
                        )
                    }

                    throw new Error(
                        i18n.t(
                            'Unknown error occurred while requesting geojson.'
                        )
                    )
                }
                return response.json()
            })
            .catch((error) => {
                throw new Error(error)
            })
    }
}

const EMPTY_FEATURE_STYLE = {}
const geoJsonUrlLoader = async (layer, engine, instanceBaseUrl) => {
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
    let loadError

    try {
        geoJson = await fetchData(newConfig.url, engine, instanceBaseUrl)
    } catch (err) {
        loadError = err
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
        data: (!loadError && buildGeoJsonFeatures(geoJson)) || [],
        config: newConfig,
        featureStyle,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
        loadError,
    }
}

export default geoJsonUrlLoader
