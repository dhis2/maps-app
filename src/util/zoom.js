import { bbox } from '@turf/bbox'

// Returns the ids of the features to zoom to, the whole layer, or null
export const getZoomTarget = (feature, layerId) => {
    if (!feature?.zoom || feature.layerId !== layerId) {
        return null
    }
    if (feature.ids?.length) {
        return { ids: feature.ids }
    }
    if (feature.id != null) {
        return { ids: [feature.id] }
    }
    return { layer: true }
}

// Returns [[west, south], [east, north]] of the features that have a geometry, or null
export const getFeaturesBounds = (features) => {
    const withGeometry = features.filter((f) => f.geometry)
    if (!withGeometry.length) {
        return null
    }

    const [minLng, minLat, maxLng, maxLat] = bbox({
        type: 'FeatureCollection',
        features: withGeometry,
    })

    if (!Number.isFinite(minLng)) {
        return null
    }

    return [
        [minLng, minLat],
        [maxLng, maxLat],
    ]
}
