import { parseLayerConfig } from '../util/external.js'

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
            .then(async (data) => {
                if (data.geojson instanceof Blob) {
                    // TODO - remove once Blob fix implemented in app-runtime
                    return JSON.parse(await data.geojson.text())
                }
                return data.geojson
            })
            .catch((e) => {
                throw new Error(`Failed to load from API route ${url}: "${e}"`)
            })
    } else {
        // External route, use fetch
        // TODO implement auth capability
        return fetch(url)
            .then((response) => response.json())
            .catch((e) => {
                throw new Error(
                    `Failed to load from external service ${url}: ${e}`
                )
            })
    }
}

const EMPTY_FEATURE_STYLE = {}
const geoJsonUrlLoader = async (layer, engine, baseUrl) => {
    const { name, config } = layer

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
    } catch (err) {
        console.error(err)
        error = {
            url: newConfig.url,
        }
    }

    const legend = { title: name, items: [] }
    legend.items.push({
        name: 'Feature',
        ...featureStyle,
        color: featureStyle.strokeColor,
        weight: featureStyle.weight,
    })

    return {
        ...layer,
        name: newConfig.name, // TODO - will be fixed by DHIS2-16088
        legend,
        data: geoJson?.features,
        config: newConfig,
        featureStyle,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
        error,
    }
}

export default geoJsonUrlLoader
