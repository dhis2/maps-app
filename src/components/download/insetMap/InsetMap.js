import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useBasemapConfig from '../../../hooks/useBasemapConfig.js'
import { BASEMAP_LAYER_INDEX } from '../../map/layers/BasemapLayer.js'
import mapApi from '../../map/MapApi.js'
import InsetMapOutline from './InsetMapOutline.js'
import styles from './styles/InsetMap.module.css'

const maxHeight = 260
const minHeight = 80

const InsetMap = ({ mainMap, isSplitView, resizeCount }) => {
    const [insetMap, setInsetMap] = useState()
    const basemap = useSelector((state) => state.map.basemap)
    const { config, isDark } = useBasemapConfig(basemap)
    const mapContainer = useRef()

    const onInsetMapReady = useCallback((evt) => setInsetMap(evt.target), [])

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
        const map = mapApi({
            attributionControl: false,
            dragRotate: false,
            touchZoomRotate: false,
            pitchWithRotate: false,
            minZoom: 0,
        })

        map.once('ready', onInsetMapReady)

        return () => {
            map.off('ready', onInsetMapReady)
        }
    }, [onInsetMapReady])

    useEffect(() => {
        if (insetMap) {
            mapContainer.current.appendChild(insetMap.getContainer())
        }
    }, [insetMap])

    useEffect(() => {
        if (insetMap && config) {
            const basemapLayer = insetMap.createLayer({
                ...config,
                index: BASEMAP_LAYER_INDEX,
            })
            insetMap.addLayer(basemapLayer)
        }
    }, [insetMap, config])

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
                <InsetMapOutline
                    mainMap={mainMap}
                    insetMap={insetMap}
                    isDark={isDark}
                />
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
