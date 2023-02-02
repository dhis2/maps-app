import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import mapApi from '../map/MapApi.js'
import styles from './styles/InsetMap.module.css'

const InsetMap = ({ map }) => {
    const [insetMap, setInsetMap] = useState()
    const [bounds, setBounds] = useState()
    const basemap = useSelector((state) => state.map.basemap.config)
    const mapContainer = useRef()

    const onMapMove = useCallback(() => {
        setBounds(map.getMapGL().getBounds())
    }, [map])

    useEffect(() => {
        mapApi({
            attributionControl: false,
        }).once('ready', (evt) => setInsetMap(evt.target))
    }, [])

    useEffect(() => {
        if (insetMap) {
            mapContainer.current.appendChild(insetMap.getContainer())
        }
    }, [insetMap])

    useEffect(() => {
        if (insetMap && basemap) {
            insetMap.addLayer(insetMap.createLayer(basemap))
        }
    }, [insetMap, basemap])

    useEffect(() => {
        map.getMapGL().on('move', onMapMove)
        return () => {
            map.getMapGL().off('move', onMapMove)
        }
    }, [map, onMapMove])

    useEffect(() => {
        if (insetMap && bounds) {
            const data = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            bounds.getSouthWest().toArray(),
                            bounds.getNorthWest().toArray(),
                            bounds.getNorthEast().toArray(),
                            bounds.getSouthEast().toArray(),
                            bounds.getSouthWest().toArray(),
                        ],
                    ],
                },
            }

            const source = insetMap.getMapGL().getSource('inset')

            if (source) {
                source.setData(data)
            } else {
                insetMap.getMapGL().addSource('inset', {
                    type: 'geojson',
                    data,
                })

                insetMap.getMapGL().addLayer({
                    id: 'inset',
                    type: 'line',
                    source: 'inset',
                    layout: {},
                    paint: {
                        'line-color': '#000',
                        'line-width': 3,
                    },
                })
            }

            const zoom = map.getMapGL().getZoom()
            // const bearing = map.getMapGL().getBearing()

            insetMap.fitBounds(bounds)
            // insetMap.getMapGL().setBearing(bearing)
            insetMap.getMapGL().setZoom(zoom - 3)
        }
    }, [map, insetMap, bounds])

    return <div ref={mapContainer} className={styles.insetMap}></div>
}

InsetMap.propTypes = {
    map: PropTypes.object.isRequired,
}

export default InsetMap
