import { isNil, omitBy, pick, isObject, omit } from 'lodash/fp'
import {
    EARTH_ENGINE_LAYER,
    GEOJSON_URL_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../constants/layers.js'

// TODO: get latitude, longitude, zoom from map + basemap: 'none'
const validMapProperties = [
    'basemap',
    'id',
    'latitude',
    'longitude',
    'mapViews',
    'name',
    'description',
    'user',
    'zoom',
    'created',
    'lastUpdated',
    'subscribers',
]

const validLayerProperties = [
    'aggregationType',
    'areaRadius',
    'band',
    'classes',
    'colorHigh', // Deprecated
    'colorLow', // Deprecated
    'colorScale',
    'columns',
    'config',
    'created',
    'datasetId',
    'displayName',
    'endDate',
    'eventCoordinateField',
    'eventClustering',
    'eventPointColor',
    'eventPointRadius',
    'eventStatus',
    'featureStyle', // used by GEOJSON_URL_LAYER, stored in layer config
    'filter',
    'filters',
    'followUp',
    'id',
    'labels',
    'labelFontSize',
    'labelFontStyle',
    'labelFontWeight',
    'labelFontColor',
    'labelTemplate',
    'lastUpdated',
    'layer',
    'layerId',
    'legendSet',
    'method',
    'name',
    'noDataColor',
    'opacity',
    'organisationUnitColor',
    'organisationUnitGroupSet',
    'organisationUnitSelectionMode',
    'orgUnitField',
    'orgUnitFieldDisplayName',
    'style',
    'period',
    'periodType',
    'renderingStrategy',
    'program',
    'programStage',
    'programStatus',
    'radiusHigh',
    'radiusLow',
    'rows',
    'serverCluster',
    'startDate',
    'styleDataItem',
    'thematicMapType',
    'trackedEntityType',
    'valueType',
    'relationshipType',
    'relatedPointColor',
    'relatedPointRadius',
    'relationshipLineColor',
    'relationshipOutsideProgram',
]

const models = ['program', 'programStage', 'organisationUnitGroupSet']

const validModelProperties = [
    'id',
    'name',
    'path',
    'dimensionType',
    'dimensionItemType',
]

export const cleanMapConfig = ({ config, defaultBasemapId }) => ({
    ...omitBy(isNil, pick(validMapProperties, config)),
    basemap: getBasemapString(config.basemap, defaultBasemapId),
    mapViews: config.mapViews.map(cleanLayerConfig),
})

export const getUnloadedCleanMapConfig = ({ config, defaultBasemapId }) => ({
    ...omitBy(isNil, pick(validMapProperties, config)),
    basemap: getBasemapString(config.basemap, defaultBasemapId),
    mapViews: config.mapViews.map(getUnloadedCleanedLayerConfig),
})

const getBasemapString = (basemap, defaultBasemapId) => {
    if (!basemap) {
        return defaultBasemapId
    }

    if (basemap.isVisible === false) {
        return 'none'
    }

    return basemap.id || defaultBasemapId
}

const cleanLayerConfig = (layer) => ({
    ...models2objects(pick(validLayerProperties, layer)),
})

const getUnloadedCleanedLayerConfig = (layer) => ({
    ...deleteUnwantedProperties(pick(validLayerProperties, layer)),
})

const deleteUnwantedProperties = (layer) => {
    const { layer: layerType } = layer

    Object.keys(layer).forEach((key) => {
        layer[key] = models.includes(key)
            ? pick(validModelProperties, layer[key])
            : layer[key]
    })

    if (layer.rows) {
        layer.rows = layer.rows.map(cleanDimension)
    }

    // Color scale needs to be stored as a string in analytical object
    if (Array.isArray(layer.colorScale)) {
        layer.colorScale = layer.colorScale.join(',')
    }

    if (layer.styleDataItem) {
        // Remove legendSet from styleDataItem as this is stored in a separate property
        // Remove names as these can be translated and will be fetched on layer load
        layer.styleDataItem = omit(
            ['legendSet', 'name', 'optionSet.name'],
            layer.styleDataItem
        )

        if (layer.styleDataItem.optionSet) {
            // Remove name and code from options as these are not persistent
            layer.styleDataItem.optionSet.options.forEach((option) => {
                delete option.name
                delete option.code
            })
        }
    }

    if (layerType === EARTH_ENGINE_LAYER) {
        delete layer.layerId
        delete layer.datasetId
        delete layer.style
        delete layer.period
        delete layer.filter
        delete layer.filters
        delete layer.periodType
        delete layer.aggregationType
        delete layer.band
    } else if (layerType === TRACKED_ENTITY_LAYER) {
        delete layer.relationshipType
        delete layer.relatedPointColor
        delete layer.relatedPointRadius
        delete layer.relationshipLineColor
        delete layer.relationshipOutsideProgram
        delete layer.periodType
    }

    delete layer.id

    return layer
}

// TODO: This feels hacky, find better way to clean map configs before saving
const models2objects = (layer) => {
    const { layer: layerType } = layer

    Object.keys(layer).forEach((key) => {
        layer[key] = models.includes(key)
            ? pick(validModelProperties, layer[key])
            : layer[key]
    })

    if (layer.rows) {
        layer.rows = layer.rows.map(cleanDimension)
    }

    if (isObject(layer.config)) {
        layer.config = JSON.stringify(layer.config) // External overlay
    }

    if (layerType === EARTH_ENGINE_LAYER) {
        const { layerId: id, band, style, aggregationType, period } = layer

        const eeConfig = {
            id,
            style,
            band,
            aggregationType,
            period,
        }

        // Removes undefined keys before stringify
        Object.keys(eeConfig).forEach(
            (key) => eeConfig[key] === undefined && delete eeConfig[key]
        )
        layer.config = JSON.stringify(eeConfig)

        delete layer.layerId
        delete layer.datasetId
        delete layer.style
        delete layer.period
        delete layer.filter
        delete layer.filters
        delete layer.periodType
        delete layer.aggregationType
        delete layer.band
    } else if (layerType === TRACKED_ENTITY_LAYER) {
        layer.config = JSON.stringify({
            relationships: layer.relationshipType
                ? {
                      type: layer.relationshipType,
                      pointColor: layer.relatedPointColor,
                      pointRadius: layer.relatedPointRadius,
                      lineColor: layer.relationshipLineColor,
                      relationshipOutsideProgram:
                          layer.relationshipOutsideProgram,
                  }
                : null,
            periodType: layer.periodType,
        })

        delete layer.relationshipType
        delete layer.relatedPointColor
        delete layer.relatedPointRadius
        delete layer.relationshipLineColor
        delete layer.relationshipOutsideProgram
        delete layer.periodType
    } else if (layerType === GEOJSON_URL_LAYER) {
        layer.config = {
            ...layer.config,
            featureStyle: { ...layer.featureStyle },
        }

        delete layer.featureStyle
    }
    delete layer.id

    if (isObject(layer.config)) {
        layer.config = JSON.stringify(layer.config) // External overlay
    }

    if (layer.styleDataItem) {
        // Remove legendSet from styleDataItem as this is stored in a separate property
        // Remove names as these can be translated and will be fetched on layer load
        layer.styleDataItem = omit(
            ['legendSet', 'name', 'optionSet.name'],
            layer.styleDataItem
        )

        if (layer.styleDataItem.optionSet) {
            // Remove name and code from options as these are not persistent
            layer.styleDataItem.optionSet.options.forEach((option) => {
                delete option.name
                delete option.code
            })
        }
    }

    // Color scale needs to be stored as a string in analytical object
    if (Array.isArray(layer.colorScale)) {
        layer.colorScale = layer.colorScale.join(',')
    }

    return layer
}

export const cleanDimension = (dim) => ({
    ...dim,
    items: dim.items.map((item) => pick(validModelProperties, item)),
})
