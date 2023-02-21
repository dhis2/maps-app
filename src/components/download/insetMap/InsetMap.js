import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import mapApi from '../../map/MapApi.js'
import InsetMapOutline from './InsetMapOutline.js'
import styles from './styles/InsetMap.module.css'

const maxHeight = 260
const minHeight = 80
const topMargin = 8

const InsetMap = ({ mainMap, isSplitView }) => {
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
            // const panelEl = mapEl.parentElement
            let mapHeight = mapEl.clientHeight

            if (mapHeight > maxHeight) {
                mapHeight = maxHeight
            } else if (mapHeight < minHeight) {
                mapHeight = minHeight
            }

            mapEl.style.height = `${mapHeight}px`

            console.log('mapHeight', mapHeight, mapEl)

            /*
            const isOverflowing = panelEl.clientHeight < panelEl.scrollHeight

            console.log(
                'isOverflowing',
                isOverflowing,
                mapEl.clientHeight,
                mapEl.scrollHeight,
                mapEl
            )

            if (isOverflowing) {
                const mapHeight =
                    300 - (panelEl.scrollHeight - panelEl.clientHeight)

                mapEl.style.height = `${mapHeight}px`

                console.log('isOverflowing', mapHeight)
            }
            */

            insetMap.resize()
        }
    }, [insetMap, mapContainer])

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
}

export default InsetMap
