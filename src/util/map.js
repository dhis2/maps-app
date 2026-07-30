import { compact, sortBy, isString } from 'lodash/fp'
import {
    ORG_UNIT_DATA_KEY,
    ORG_UNIT_PATH_DATA_KEY,
} from '../constants/dataTable.js'
import { dimConf } from '../constants/dimension.js'
import { PADDING_DEFAULT, DURATION_DEFAULT } from '../constants/layers.js'

export const toGeoJson = (organisationUnits) =>
    sortBy('le', organisationUnits)
        .map((ou) => {
            const coord = JSON.parse(ou.co)
            let gpid = ''
            let gppg = ''
            let type = 'Point'

            if (ou.ty === 2) {
                type = 'Polygon'
                if (ou.co.substring(0, 4) === '[[[[') {
                    type = 'MultiPolygon'
                }
            }

            const ancestorIds =
                isString(ou.pg) && ou.pg.length ? compact(ou.pg.split('/')) : []

            // Grand parent
            if (ancestorIds.length >= 2) {
                gpid = ancestorIds[ancestorIds.length - 2]
            }
            if (ancestorIds.length > 2) {
                gppg = '/' + ancestorIds.slice(0, -2).join('/')
            }

            const orgUnitPath = '/' + [...ancestorIds, ou.id].join('/')

            return {
                type: 'Feature',
                id: ou.id,
                geometry: {
                    type,
                    coordinates: coord,
                },
                properties: {
                    type,
                    id: ou.id,
                    name: ou.na,
                    hasCoordinatesDown: ou.hcd,
                    hasCoordinatesUp: ou.hcu,
                    level: ou.le,
                    grandParentParentGraph: gppg,
                    grandParentId: gpid,
                    parentGraph: ou.pg,
                    parentId: ou.pi,
                    parentName: ou.pn,
                    [ORG_UNIT_PATH_DATA_KEY]: orgUnitPath,
                    [ORG_UNIT_DATA_KEY]: orgUnitPath,
                    dimensions: ou.dimensions,
                },
            }
        })
        .filter(
            ({ geometry }) =>
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length &&
                geometry.coordinates.flat().length
        )

export const getLayerFeatureHighlight = (feature, layerId) =>
    feature && (feature.layerId === layerId || feature.crossLayerIds?.[layerId])
        ? feature
        : null

export const fitCrossLayerZoomBounds = (map, feature, prevFeature) => {
    if (feature === prevFeature || !feature?.zoom || !feature.bounds) {
        return
    }
    map.fitBounds(feature.bounds, {
        padding: PADDING_DEFAULT,
        duration: DURATION_DEFAULT,
        essential: true,
        bearing: map.getMapGL().getBearing(),
    })
}

// eslint-disable-next-line max-params
export const drillUpDown = (layerConfig, parentId, parentGraph, level) => ({
    ...layerConfig,
    rows: [
        {
            dimension: dimConf.organisationUnit.objectName,
            items: [
                { id: parentId, path: `${parentGraph}/${parentId}` },
                { id: 'LEVEL-' + level },
            ],
        },
    ],
    isLoaded: false,
    isLoading: false,
})

export const resizeAndFitBounds = (map) => {
    map.resize()
    const bounds = map.getLayersBounds()
    if (Array.isArray(bounds)) {
        map.fitBounds(bounds)
    }
}

// Called when plugin maps enter or exit fullscreen
export const onFullscreenChange = (map, isFullscreen = false) => {
    map.toggleMultiTouch(!isFullscreen)
    map.toggleScrollZoom(isFullscreen)
    requestAnimationFrame(() =>
        requestAnimationFrame(() => resizeAndFitBounds(map))
    )
}
