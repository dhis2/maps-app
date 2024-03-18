import i18n from '@dhis2/d2-i18n'
import { parseLayerConfig } from '../util/external.js'
import {
    buildGeoJsonFeatures,
    GEO_TYPE_LINE,
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
} from '../util/geojson.js'

const fetchData = async (url, engine, instanceBaseUrl) => {
    if (url.includes(instanceBaseUrl)) {
        // API route, use engine
        const routesIndex = url.indexOf('routes')
        if (routesIndex === -1) {
            throw new Error()
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
            .catch(() => {
                throw new Error()
            })
    } else {
        // External route, use fetch
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error()
                }
                return response.json()
            })
            .catch(() => {
                throw new Error()
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
    } catch (e) {
        loadError = i18n.t(
            'There was a problem with this layer. Contact a system administrator.'
        )
    }

    let data = []
    const legend = {
        title: newConfig.name,
        items: [],
    }
    if (!loadError) {
        const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
        data = featureCollection

        const oneType = types.length === 1

        types.forEach((type) => {
            let legendItem
            if (type === GEO_TYPE_POLYGON) {
                legendItem = {
                    name: oneType ? i18n.t('Feature') : i18n.t('Polygon'),
                    type: GEO_TYPE_POLYGON,
                    ...featureStyle,
                    fillColor: featureStyle.color,
                }
            } else if (type === GEO_TYPE_LINE) {
                legendItem = {
                    name: oneType ? i18n.t('Feature') : i18n.t('Line'),
                    type: GEO_TYPE_LINE,
                    ...featureStyle,
                    color: featureStyle.strokeColor,
                }
            } else {
                legendItem = {
                    name: oneType ? i18n.t('Feature') : i18n.t('Point'),
                    type: GEO_TYPE_POINT,
                    radius: featureStyle.pointSize,
                    color: featureStyle.color,
                    strokeColor: featureStyle.strokeColor,
                }
            }
            legend.items.push(legendItem)
        })
    }

    return {
        ...layer,
        name: newConfig.name, // TODO - will be fixed by DHIS2-16088
        legend,
        data,
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
