import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import mapApi from '../map/MapApi.js'
import Plugin from '../plugin/Plugin.js'
import styles from './styles/InsetMap.module.css'

const InsetMap = () => {
    const [map, setMap] = useState()

    useEffect(() => {
        mapApi({
            attributionControl: false,
        }).once('ready', (evt) => setMap(evt.target))
    }, [])

    useEffect(() => {
        console.log('map', map)
    }, [map])

    return <div className={styles.insetMap}></div>
}

export default InsetMap
