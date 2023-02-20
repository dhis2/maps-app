import Point from '@mapbox/point-geometry'
import PropTypes from 'prop-types'
import { useState, useCallback, useEffect } from 'react'
import { GEOJSON_LAYER } from '../../../constants/layers.js'

const layerId = 'inset-outline'

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

const InsetMapOutline = ({ mainMap, insetMap }) => {
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
                    strokeColor: '#333',
                    weight: 3,
                },
            }

            if (!sourceId) {
                const layer = insetMap.createLayer(config)
                insetMap.addLayer(layer)
                setSourceId(layer.getId())
            } else {
                const source = insetMap.getMapGL().getSource(sourceId)
                if (source) {
                    source.setData(outline)
                }
            }
        }
    }, [insetMap, outline, sourceId])

    return null
}

InsetMapOutline.propTypes = {
    insetMap: PropTypes.object.isRequired,
    mainMap: PropTypes.object.isRequired,
}

export default InsetMapOutline