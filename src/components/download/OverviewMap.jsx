import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setDownloadConfig } from '../../actions/download.js'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import { BASEMAP_LAYER_INDEX } from '../map/layers/BasemapLayer.js'
import mapApi from '../map/MapApi.js'
import OverviewMapOutline from './OverviewMapOutline.js'
import styles from './styles/OverviewMap.module.css'

const maxHeight = 260
const minHeight = 80

const OverviewMap = ({ mainMap, isSplitView, resizeCount }) => {
    const { baseUrl } = useConfig()
    const [overviewMap, setOverviewMap] = useState()
    const basemap = useSelector((state) => state.map.basemap)
    const { config, isDark } = useBasemapConfig(basemap)
    const mapContainer = useRef()
    const dispatch = useDispatch()

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

        if (overviewMap) {
            // Don't sync overview map after it is dragged by the user
            overviewMap
                .getMapGL()
                .once('drag', () => mainMap.off('move', onMainMapMove))
        }

        return () => {
            mainMap.off('move', onMainMapMove)
        }
    }, [mainMap, overviewMap, onMainMapMove])

    useEffect(() => {
        const map = mapApi({
            attributionControl: false,
            dragRotate: false,
            touchZoomRotate: false,
            pitchWithRotate: false,
            minZoom: 0,
            baseUrl,
        })

        map.once('ready', onOverviewMapReady)

        return () => {
            map.off('ready', onOverviewMapReady)
        }
    }, [onOverviewMapReady, baseUrl])

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

            const hasSpace = mapHeight > minHeight

            if (hasSpace) {
                mapEl.style.height = `${mapHeight}px`
                overviewMap.resize()
            } else {
                mapEl.style.display = 'none'
            }

            // Disable overview map checkbox if no space
            dispatch(
                setDownloadConfig({
                    hasOverviewMapSpace: hasSpace,
                })
            )
        }
    }, [overviewMap, mapContainer, resizeCount, dispatch])

    return (
        <div
            ref={mapContainer}
            className={styles.overviewMap}
            data-test="overview-map"
        >
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
