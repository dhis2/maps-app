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

// Map.jsx passes each Layer instance only the slice of state.feature it
// owns, rather than the raw global value, so a highlight never re-triggers
// componentDidUpdate on unrelated layers. A crossLayerIds-based highlight
// (layerId: null, set only by CombinedDataTable) has no single owning
// layerId, so it must be forwarded to every layer named in crossLayerIds
// instead of matched by layerId alone - Layer.js's own getHoverIds already
// narrows it down further, to just the ids belonging to that layer.
export const getLayerFeatureHighlight = (feature, layerId) =>
    feature && (feature.layerId === layerId || feature.crossLayerIds?.[layerId])
        ? feature
        : null

// The crossLayerIds counterpart to each Layer instance's own
// handleFeatureUpdate/fitBounds - a crossLayerIds zoom has no single owning
// layerId, so several Layer instances would otherwise race independent
// fitBounds() calls. Map.jsx calls this once at the top level instead, with
// bounds precomputed by the caller (CombinedDataTable.jsx, via
// getUnionBounds) from every matching feature across every participating
// layer.
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

//eslint-disable-next-line max-params
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
