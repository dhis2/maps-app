import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import turfCentroid from '@turf/centroid'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
} from './geojson.js'

const isPolygon = (geometry) =>
    [GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(geometry?.type)

// A feature is tested as-is when it's already a point; when it isn't (e.g.
// an Event/TrackedEntity feature whose geometry happens to be a polygon)
// and useCentroid is set, its centroid stands in for it instead. Non-point
// geometry is otherwise left untestable (returns null) rather than
// silently matching on the wrong shape.
const getTestPoint = (feature, useCentroid) => {
    if (feature.geometry?.type === GEO_TYPE_POINT) {
        return feature
    }
    return useCentroid && feature.geometry
        ? turfCentroid(feature.geometry)
        : null
}

/**
 * Matches each of `features` against whichever `referenceOrgUnits` feature's
 * polygon geometry spatially contains it - used for a participating layer's
 * "spatial join" against the Combined data table's reference org unit set
 * (every reference org unit acts as one bucket, unlike the single fixed
 * polygon layer the old point+polygon join used).
 *
 * @param {object[]} features
 * @param {object[]} referenceOrgUnits
 * @param {{ useCentroid?: boolean }} [options]
 * @returns {Array<{ featureProps: object, referenceId: string|null }>}
 */
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
