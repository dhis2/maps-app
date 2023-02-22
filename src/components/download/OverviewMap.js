import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import { BASEMAP_LAYER_INDEX } from '../map/layers/BasemapLayer.js'
import mapApi from '../map/MapApi.js'
import OverviewMapOutline from './OverviewMapOutline.js'
import styles from './styles/OverviewMap.module.css'

const maxHeight = 260
const minHeight = 80

const OverviewMap = ({ mainMap, isSplitView, resizeCount }) => {
    const [overviewMap, setOverviewMap] = useState()
    const basemap = useSelector((state) => state.map.basemap)
    const { config, isDark } = useBasemapConfig(basemap)
    const mapContainer = useRef()

    const onOverviewMapReady = useCallback(
        (evt) => setOverviewMap(evt.target),
        []
    )

    const onMainMapMove = useCallback(() => {
        if (overviewMap) {
            const mapGl = overviewMap.getMapGL()
            mapGl.resize()
            mapGl.setCenter(mainMap.getCenter())
            mapGl.setZoom(mainMap.getZoom() - (isSplitView ? 2 : 4))
        }
    }, [mainMap, overviewMap, isSplitView])

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

        map.once('ready', onOverviewMapReady)

        return () => {
            map.off('ready', onOverviewMapReady)
        }
    }, [onOverviewMapReady])

    useEffect(() => {
        if (overviewMap) {
            mapContainer.current.appendChild(overviewMap.getContainer())
        }
    }, [overviewMap])

    useEffect(() => {
        if (overviewMap && config) {
            const basemapLayer = overviewMap.createLayer({
                ...config,
                index: BASEMAP_LAYER_INDEX,
            })
            overviewMap.addLayer(basemapLayer)
        }
    }, [overviewMap, config])

    useEffect(() => {
        if (overviewMap) {
            onMainMapMove()
        }
    }, [overviewMap, onMainMapMove])

    useEffect(() => {
        if (overviewMap) {
            const mapEl = mapContainer.current

            mapEl.style.display = 'block'
            mapEl.style.height = `${maxHeight}px`

            let mapHeight = mapEl.clientHeight

            if (mapHeight > maxHeight) {
                mapHeight = maxHeight
            }

            if (mapHeight > minHeight) {
                mapEl.style.height = `${mapHeight}px`
                overviewMap.resize()
            } else {
                // No room for inset map
                mapEl.style.display = 'none'
            }
        }
    }, [overviewMap, mapContainer, resizeCount])

    return (
        <div ref={mapContainer} className={styles.overviewMap}>
            {overviewMap && (
                <OverviewMapOutline
                    mainMap={mainMap}
                    overviewMap={overviewMap}
                    isDark={isDark}
                />
            )}
        </div>
    )
}

OverviewMap.propTypes = {
    mainMap: PropTypes.object.isRequired,
    isSplitView: PropTypes.bool,
    resizeCount: PropTypes.number,
}

export default OverviewMap
