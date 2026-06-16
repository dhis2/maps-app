import PropTypes from 'prop-types'
import { useState, useRef, useCallback, useEffect } from 'react'
import { GEOJSON_LAYER } from '../../constants/layers.js'
import { getCssColor } from '../../util/colors.js'
import { getCoordinatesBounds } from '../../util/geojson.js'

const layerId = 'overview-outline'

// Returns a feature with the main map outline (with bearing and pitch)
const getMapOutline = (map) => {
    const canvas = map.getCanvas()
    const width = canvas.width
    const height = canvas.height

    const upperLeft = map.unproject([0, 0]).toArray()
    const lowerLeft = map.unproject([0, height]).toArray()
    const lowerRight = map.unproject([width, height]).toArray()
    const upperRight = map.unproject([width, 0]).toArray()

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
    const sourceIdRef = useRef()
    const layerRef = useRef()

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
            const strokeColor = isDark
                ? getCssColor('--colors-grey300')
                : getCssColor('--colors-grey900')
            const config = {
                type: GEOJSON_LAYER,
                id: layerId,
                index: 1,
                data: [outline],
                style: {
                    color: 'transparent',
                    strokeColor,
                    weight: 3,
                },
            }

            if (!sourceIdRef.current) {
                const layer = overviewMap.createLayer(config)
                overviewMap.addLayer(layer)
                sourceIdRef.current = layer.getId()
                layerRef.current = layer
            } else {
                const mapGl = overviewMap.getMapGL()
                const source = mapGl.getSource(sourceIdRef.current)
                if (source) {
                    source.setData(outline)
                }
                const outlineLayerId = `${sourceIdRef.current}-outline`
                if (mapGl.getLayer(outlineLayerId)) {
                    mapGl.setPaintProperty(
                        outlineLayerId,
                        'line-color',
                        strokeColor
                    )
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
    }, [overviewMap, outline, isDark])

    useEffect(() => {
        return () => {
            if (layerRef.current) {
                overviewMap.removeLayer(layerRef.current)
                layerRef.current = undefined
                sourceIdRef.current = undefined
            }
        }
    }, [overviewMap])

    return null
}

OverviewMapOutline.propTypes = {
    mainMap: PropTypes.object.isRequired,
    overviewMap: PropTypes.object.isRequired,
    isDark: PropTypes.bool,
}

export default OverviewMapOutline
