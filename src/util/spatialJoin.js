import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON } from './geojson.js'

/**
 * For each point feature in pointLayer.data, finds the first polygon feature
 * in polygonLayer.data that spatially contains it.
 *
 * @param {{ data: object[] }} pointLayer
 * @param {{ data: object[] }} polygonLayer
 * @returns {Array<{ pointProps: object, polygonProps: object|null }>}
 */
export const spatialJoin = (pointLayer, polygonLayer) => {
    const points = pointLayer.data ?? []
    const polygons = polygonLayer.data ?? []

    return points.map((pointFeature) => {
        const matched = polygons.find(
            (poly) =>
                [GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(
                    poly.geometry?.type
                ) && booleanPointInPolygon(pointFeature, poly)
        )
        return {
            pointProps: pointFeature.properties || pointFeature,
            polygonProps: matched?.properties ?? null,
        }
    })
}
