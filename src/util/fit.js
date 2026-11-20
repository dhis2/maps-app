import turfBbox from '@turf/bbox'
import { DURATION_DEFAULT, PADDING_DEFAULT } from '../constants/layers.js'

// In the [[west, south], [east, north]] form that map.fitBounds takes
export const getFeaturesBounds = (features) => {
    const withGeometry = features.filter((f) => f.geometry)
    if (!withGeometry.length) {
        return null
    }

    const [minLng, minLat, maxLng, maxLat] = turfBbox({
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

// Takes any number of features, so later actions can fit several at once
export const fitFeatures = (map, features) => {
    const bounds = getFeaturesBounds(features)
    if (!bounds) {
        return
    }

    map.fitBounds(bounds, {
        padding: PADDING_DEFAULT,
        duration: DURATION_DEFAULT,
        essential: true,
        maxZoom: 17,
    })
}
