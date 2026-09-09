import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import turfCentroid from '@turf/centroid'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
} from './geojson.js'

const isPolygon = (geometry) =>
    [GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(geometry?.type)

const getTestPoint = (feature, useCentroid) => {
    if (feature.geometry?.type === GEO_TYPE_POINT) {
        return feature
    }
    return useCentroid && feature.geometry
        ? turfCentroid(feature.geometry)
        : null
}

export const matchFeaturesToReferenceOrgUnits = (
    features,
    referenceOrgUnits,
    { useCentroid = false } = {}
) => {
    const polygons = referenceOrgUnits.filter((ref) => isPolygon(ref.geometry))

    return features.map((feature) => {
        const testPoint = getTestPoint(feature, useCentroid)
        const matched = testPoint
            ? polygons.find((ref) => booleanPointInPolygon(testPoint, ref))
            : null

        return {
            featureProps: feature.properties || feature,
            referenceId: matched ? (matched.properties || matched).id : null,
        }
    })
}
