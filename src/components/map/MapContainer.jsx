import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAggregations } from '../../actions/aggregations.js'
import { highlightFeature, setFeatureProfile } from '../../actions/feature.js'
import { openContextMenu, closeCoordinatePopup } from '../../actions/map.js'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import MapLoadingMask from './MapLoadingMask.jsx'
import MapName from './MapName.jsx'
import MapView from './MapView.jsx'

const MapContainer = ({ resizeCount, setMap }) => {
    const { basemap, coordinatePopup, mapViews, bounds } = useSelector(
        (state) => state.map
    )
    const interpretationModalOpen = useSelector(
        (state) => !!state.interpretation.id
    )
    const feature = useSelector((state) => state.feature)
    const { layersSorting } = useSelector((state) => state.ui)
    const basemapConfig = useBasemapConfig(basemap)
    const dispatch = useDispatch()

    // Map -> table hover sync. maps-gl tracks the hovered features itself, so
    // we read them after each mousemove and publish the hovered feature.
    const [mapObject, setMapObject] = useState()
    const hoveredIdRef = useRef(null)

    useEffect(() => {
        const mapgl = mapObject?.getMapGL?.()
        if (!mapgl) {
            return
        }
        const publish = (feature) => {
            const id = feature?.properties?.id ?? null
            if (id !== hoveredIdRef.current) {
                hoveredIdRef.current = id
                dispatch(
                    highlightFeature(
                        id
                            ? { id, layerId: feature.source, origin: 'map' }
                            : null
                    )
                )
            }
        }
        const onMouseMove = () => publish(mapObject._hoverFeatures?.[0])
        const onMouseOut = () => publish(null)

        mapgl.on('mousemove', onMouseMove)
        mapgl.on('mouseout', onMouseOut)
        return () => {
            mapgl.off('mousemove', onMouseMove)
            mapgl.off('mouseout', onMouseOut)
        }
    }, [mapObject, dispatch])

    const loadedMapViews = mapViews.filter((layer) => layer.isLoaded)
    const isLoading = loadedMapViews.length !== mapViews.length

    return (
        <>
            <MapName />
            <MapView
                isPlugin={false}
                basemap={basemapConfig}
                layers={loadedMapViews}
                bounds={bounds}
                feature={feature}
                openContextMenu={(config) => dispatch(openContextMenu(config))}
                coordinatePopup={coordinatePopup}
                interpretationModalOpen={interpretationModalOpen}
                closeCoordinatePopup={() => dispatch(closeCoordinatePopup())}
                setAggregations={(data) => dispatch(setAggregations(data))}
                setFeatureProfile={(val) => dispatch(setFeatureProfile(val))}
                resizeCount={resizeCount}
                setMapObject={(map) => {
                    setMap(map)
                    setMapObject(map)
                }}
                layersSorting={layersSorting}
            />
            {isLoading && <MapLoadingMask />}
        </>
    )
}

MapContainer.propTypes = {
    resizeCount: PropTypes.number.isRequired,
    setMap: PropTypes.func.isRequired,
}

export default MapContainer
