import Point from '@mapbox/point-geometry'
import PropTypes from 'prop-types'
import { useState, useCallback, useEffect } from 'react'
import { GEOJSON_LAYER } from '../../constants/layers.js'
import { getCoordinatesBounds } from '../../util/geojson.js'

const layerId = 'overview-outline'

// Returns a feature with the main map outline (with bearing and pitch)
const getMapOutline = (map) => {
    const { transform } = map
    const { width, height } = transform

    const upperLeft = transform.pointLocation(new Point(0, 0)).toArray()
    const lowerLeft = transform.pointLocation(new Point(0, height)).toArray()
    const lowerRight = transform
        .pointLocation(new Point(width, height))
        .toArray()
    const upperRight = transform.pointLocation(new Point(width, 0)).toArray()

    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [upperLeft, lowerLeft, lowerRight, upperRight, upperLeft],
            ],
        },
        properties: {},
    }
}

const OverviewMapOutline = ({ mainMap, overviewMap, isDark = false }) => {
    const [outline, setOutline] = useState(getMapOutline(mainMap))
    const [sourceId, setSourceId] = useState()

    const onMainMapMove = useCallback(() => {
        setOutline(getMapOutline(mainMap))
    }, [mainMap])

    useEffect(() => {
        mainMap.on('move', onMainMapMove)
        return () => {
            mainMap.off('move', onMainMapMove)
        }
    }, [mainMap, onMainMapMove])

    useEffect(() => {
        if (outline) {
            const config = {
                type: GEOJSON_LAYER,
                id: layerId,
                index: 1,
                data: [outline],
                style: {
                    color: 'transparent',
                    strokeColor: isDark ? 'orange' : '#333',
                    weight: 3,
                },
            }

            if (!sourceId) {
                const layer = overviewMap.createLayer(config)
                overviewMap.addLayer(layer)
                setSourceId(layer.getId())
            } else {
                const source = overviewMap.getMapGL().getSource(sourceId)
                if (source) {
                    source.setData(outline)
                }
            }

            // Make sure outline bounds is inside overview map bounds
            const mapBounds = overviewMap.getMapGL().getBounds()
            const outlineBounds = getCoordinatesBounds(
                outline.geometry.coordinates[0]
            )

            // If outline bounds is outside overview map bounds
            if (
                !mapBounds.contains(outlineBounds[0]) ||
                !mapBounds.contains(outlineBounds[1])
            ) {
                // Fit overview map to outline bounds
                overviewMap.getMapGL().fitBounds(outlineBounds, { padding: 80 })
            }
        }
    }, [overviewMap, outline, sourceId, isDark])

    return null
}

OverviewMapOutline.propTypes = {
    mainMap: PropTypes.object.isRequired,
    overviewMap: PropTypes.object.isRequired,
    isDark: PropTypes.bool,
}

export default OverviewMapOutline
