import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import mapApi from '../map/MapApi.js'
import styles from './styles/InsetMap.module.css'

const InsetMap = () => {
    const [map, setMap] = useState()
    const basemap = useSelector((state) => state.map.basemap)
    const mapId = useSelector((state) => state.map.id)
    const mapContainer = useRef()

    useEffect(() => {
        mapApi({
            attributionControl: false,
        }).once('ready', (evt) => setMap(evt.target))
    }, [])

    useEffect(() => {
        if (map) {
            mapContainer.current.appendChild(map.getContainer())

            const basemapLayer = map.createLayer({
                ...basemap.config,
            })

            map.addLayer(basemapLayer)

            console.log('mapId', mapId)

            map.fitWorld()
            map.sync('inset')
        }
    }, [map, mapContainer, basemap, mapId])

    return <div ref={mapContainer} className={styles.insetMap}></div>
}

export default InsetMap
