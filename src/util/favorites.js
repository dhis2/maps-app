import { isNil, omitBy, pick, isObject, omit } from 'lodash/fp'
import {
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    GEOJSON_URL_LAYER,
} from '../constants/layers.js'

// TODO: get latitude, longitude, zoom from map + basemap: 'none'
const validMapProperties = [
    // 'basemap' and 'basemaps' removed — set exclusively by getBasemapPayload
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
    'geometryCentroid',
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
    'countEventsWithoutCoordinates',
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
    'hidden',
    'organisationUnitColor',
    'organisationUnitGroupSet',
    'organisationUnitSelectionMode',
    'orgUnitField',
    'orgUnitFieldDisplayName',
    'countOrgUnitsWithoutCoordinates',
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

export const cleanMapConfig = ({
    config,
    defaultBasemapId,
    serverVersion,
    cleanMapviewConfig = true,
}) => ({
    ...omitBy(isNil, pick(validMapProperties, config)),
    ...getBasemapPayload(config.basemap, defaultBasemapId, serverVersion),
    mapViews: config.mapViews.map((view) =>
        cleanLayerConfig(view, cleanMapviewConfig)
    ),
})

// VERSION-TOGGLE: https://dhis2.atlassian.net/browse/DHIS2-20417
const getBasemapPayload = (basemap, defaultBasemapId, serverVersion) => {
    if (serverVersion?.minor >= 43) {
        return {
            basemaps: [
                {
                    id: basemap?.id || defaultBasemapId,
                    opacity: basemap?.opacity ?? 1,
                    hidden: basemap?.isVisible === false,
                },
            ],
        }
    }

    // Legacy: store as JSON to preserve opacity and id when hidden
    return {
        basemap: JSON.stringify({
            id: basemap?.id || defaultBasemapId,
            opacity: basemap?.opacity ?? 1,
            hidden: basemap?.isVisible === false,
        }),
    }
}

const cleanLayerConfig = (layer, cleanMapviewConfig) => ({
    ...models2objects(
        pick(validLayerProperties, {
            ...layer,
            hidden: layer.isVisible === false,
        }),
        cleanMapviewConfig
    ),
})

// TODO: This feels hacky, find better way to clean map configs before saving
const models2objects = (layer, cleanMapviewConfig) => {
    const { layer: layerType } = layer

    Object.keys(layer).forEach((key) => {
        layer[key] = models.includes(key)
            ? pick(validModelProperties, layer[key])
            : layer[key]
    })

    if (layer.rows) {
        layer.rows = layer.rows.map(cleanDimension)
    }

    if (
        layerType === THEMATIC_LAYER ||
        layerType === ORG_UNIT_LAYER ||
        layerType === FACILITY_LAYER
    ) {
        if (cleanMapviewConfig && layer.countOrgUnitsWithoutCoordinates) {
            layer.config = JSON.stringify({
                countOrgUnitsWithoutCoordinates: true,
            })
        }
        delete layer.countOrgUnitsWithoutCoordinates
    } else if (layerType === EARTH_ENGINE_LAYER) {
        if (cleanMapviewConfig) {
            const {
                layerId: id,
                band,
                style,
                aggregationType,
                period,
                countOrgUnitsWithoutCoordinates,
            } = layer

            const eeConfig = {
                id,
                style,
                band,
                aggregationType,
                period,
                countOrgUnitsWithoutCoordinates,
            }

            // Removes undefined keys before stringify
            Object.keys(eeConfig).forEach(
                (key) => eeConfig[key] === undefined && delete eeConfig[key]
            )

            layer.config = JSON.stringify(eeConfig)
        }

        delete layer.layerId
        delete layer.datasetId
        delete layer.style
        delete layer.period
        delete layer.filter
        delete layer.filters
        delete layer.periodType
        delete layer.aggregationType
        delete layer.band
        delete layer.countOrgUnitsWithoutCoordinates
    } else if (layerType === TRACKED_ENTITY_LAYER) {
        if (cleanMapviewConfig) {
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
        }

        delete layer.relationshipType
        delete layer.relatedPointColor
        delete layer.relatedPointRadius
        delete layer.relationshipLineColor
        delete layer.relationshipOutsideProgram
        delete layer.periodType
    } else if (layerType === EVENT_LAYER) {
        if (cleanMapviewConfig && layer.countEventsWithoutCoordinates) {
            layer.config = JSON.stringify({
                countEventsWithoutCoordinates: true,
            })
        }
        delete layer.countEventsWithoutCoordinates
    } else if (layerType === GEOJSON_URL_LAYER) {
        if (cleanMapviewConfig) {
            layer.config = {
                ...layer.config,
                featureStyle: { ...layer.featureStyle },
            }
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
