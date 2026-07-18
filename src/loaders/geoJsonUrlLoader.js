import i18n from '@dhis2/d2-i18n'
import { parseLayerConfig } from '../util/external.js'
import {
    buildGeoJsonFeatures,
    GEO_TYPE_LINE,
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
} from '../util/geojson.js'

// features of different (non-Multi-normalized) geometry types get their
// own color, matching the map legend's own per-type color - never
// overwrites a feature's own pre-existing color (maps-gl's colorExpr
// already prefers a per-feature properties.color over the layer's
// uniform style color, so a feature that already has one is rendered
// with it, and the data table should reflect the same real color).
export const stampFeatureColors = (features, legendItemsByType) =>
    features.map((f) => {
        if (f.properties.color != null) {
            return f
        }
        const nonMultiType = f.geometry.type.replaceAll('Multi', '')
        const color = legendItemsByType[nonMultiType]?.color
        return color ? { ...f, properties: { ...f.properties, color } } : f
    })

const fetchData = async (url, engine, baseUrl) => {
    if (url.includes(baseUrl)) {
        // API route, use engine
        const routesIndex = url.indexOf('routes')
        if (routesIndex === -1) {
            throw new Error(
                'Invalid API route: URL does not contain a "routes" segment'
            )
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
                throw new Error('Failed to fetch GeoJSON from API route')
            })
    } else {
        // External route, use fetch
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        'Failed to fetch GeoJSON: response was not ok'
                    )
                }
                return response.json()
            })
            .catch(() => {
                throw new Error('Failed to fetch GeoJSON from external URL')
            })
    }
}

const EMPTY_FEATURE_STYLE = {}
const geoJsonUrlLoader = async ({
    config: layer,
    engine,
    baseUrl,
    keyAnalysisDigitGroupSeparator,
}) => {
    const { config } = layer

    let newConfig
    let featureStyle
    let dataTableColumnConfig
    // keep featureStyle and dataTableColumnConfig properties outside of config while in app
    if (typeof config === 'string') {
        // External layer is loaded in analytical object
        newConfig = await parseLayerConfig(config, engine)
        featureStyle = { ...newConfig.featureStyle } || EMPTY_FEATURE_STYLE
        dataTableColumnConfig = newConfig.dataTableColumnConfig
        delete newConfig.featureStyle
        delete newConfig.dataTableColumnConfig
    } else {
        newConfig = { ...config }
        featureStyle = layer.featureStyle || EMPTY_FEATURE_STYLE
        dataTableColumnConfig = layer.dataTableColumnConfig
    }

    let geoJson
    let loadError

    try {
        geoJson = await fetchData(newConfig.url, engine, baseUrl)
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

        const oneType = types.length === 1
        const legendItemsByType = {}

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
            legendItemsByType[type] = legendItem
        })

        // A per-geometry-type color, for the data table's Color column -
        // features of different types in the same file get different
        // colors here, matching what the map legend already shows per type.
        data = stampFeatureColors(featureCollection, legendItemsByType)
    }

    return {
        ...layer,
        name: newConfig.name, // VERSION-TOGGLE: remove when 41 is lowest supported version, overrides layer.name from spread (DHIS2-16088)
        legend,
        data,
        keyAnalysisDigitGroupSeparator,
        config: newConfig,
        featureStyle,
        dataTableColumnConfig,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        loadError,
    }
}

export default geoJsonUrlLoader
