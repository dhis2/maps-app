import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import mapApi from '../../map/MapApi.js'
import InsetMapOutline from './InsetMapOutline.js'
import styles from './styles/InsetMap.module.css'

const maxHeight = 260
const minHeight = 80

const InsetMap = ({ mainMap, isSplitView, resizeCount }) => {
    const [insetMap, setInsetMap] = useState()
    const basemap = useSelector((state) => state.map.basemap.config)
    const mapContainer = useRef()

    const onMainMapMove = useCallback(() => {
        if (insetMap) {
            const mapGl = insetMap.getMapGL()
            mapGl.resize()
            mapGl.setCenter(mainMap.getCenter())
            mapGl.setZoom(mainMap.getZoom() - (isSplitView ? 2 : 4))
        }
    }, [mainMap, insetMap, isSplitView])

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
        if (insetMap) {
            const mapEl = mapContainer.current

            mapEl.style.display = 'block'
            mapEl.style.height = `${maxHeight}px`

            let mapHeight = mapEl.clientHeight

            if (mapHeight > maxHeight) {
                mapHeight = maxHeight
            }

            if (mapHeight > minHeight) {
                mapEl.style.height = `${mapHeight}px`
                insetMap.resize()
            } else {
                // No room for inset map
                mapEl.style.display = 'none'
            }
        }
    }, [insetMap, mapContainer, resizeCount])

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
    isSplitView: PropTypes.bool,
    resizeCount: PropTypes.number,
}

export default InsetMap
