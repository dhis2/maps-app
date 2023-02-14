import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import mapApi from '../../map/MapApi.js'
import InsetMapOutline from './InsetMapOutline.js'
import styles from './styles/InsetMap.module.css'

const InsetMap = ({ mainMap }) => {
    const [insetMap, setInsetMap] = useState()
    const basemap = useSelector((state) => state.map.basemap.config)
    const mapContainer = useRef()

    const onMainMapMove = useCallback(() => {
        if (insetMap) {
            const mapGl = insetMap.getMapGL()
            mapGl.resize()
            mapGl.setCenter(mainMap.getCenter())
            mapGl.setZoom(mainMap.getZoom() - 4)
        }
    }, [mainMap, insetMap])

    useEffect(() => {
        mainMap.on('move', onMainMapMove)
        return () => {
            mainMap.off('move', onMainMapMove)
        }
    }, [mainMap, onMainMapMove])

    useEffect(() => {
        mapApi({
            attributionControl: false,
            dragRotate: false,
            touchZoomRotate: false,
            pitchWithRotate: false,
        }).once('ready', (evt) => setInsetMap(evt.target))
    }, [])

    useEffect(() => {
        if (insetMap) {
            mapContainer.current.appendChild(insetMap.getContainer())
        }
    }, [insetMap])

    useEffect(() => {
        if (insetMap && basemap) {
            const basemapLayer = insetMap.createLayer({ ...basemap, index: 0 })
            insetMap.addLayer(basemapLayer)
        }
    }, [insetMap, basemap])

    useEffect(() => {
        if (insetMap) {
            onMainMapMove()
        }
    }, [insetMap, onMainMapMove])

    useEffect(() => {
        // TODO: Don't allow the map container to overflow the right column
        // https://www.google.com/search?q=javascript+check+if+element+is+overflowing&oq=javascript+check+if+element+is+ov&aqs=chrome.1.69i57j0i512j0i22i30i625l8.8282j0j7&sourceid=chrome&ie=UTF-8
        console.log('mapContainer', mapContainer.current)
    }, [mapContainer])

    return (
        <div ref={mapContainer} className={styles.insetMap}>
            {insetMap && (
                <InsetMapOutline mainMap={mainMap} insetMap={insetMap} />
            )}
        </div>
    )
}

InsetMap.propTypes = {
    mainMap: PropTypes.object.isRequired,
}

export default InsetMap
