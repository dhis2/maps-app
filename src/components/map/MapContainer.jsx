import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAggregations } from '../../actions/aggregations.js'
import {
    highlightFeature,
    setFeatureProfile,
    clickFeature,
} from '../../actions/feature.js'
import { openContextMenu, closeCoordinatePopup } from '../../actions/map.js'
import { toggleFeatureSelection } from '../../actions/selection.js'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import useDebouncedHighlightFeature from '../../hooks/useDebouncedHighlightFeature.js'
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
    const selection = useSelector((state) => state.selection)
    const { layersSorting, highlightColor, selectionFilter } = useSelector(
        (state) => state.ui
    )
    const basemapConfig = useBasemapConfig(basemap)
    const dispatch = useDispatch()

    const dispatchHighlightFeature = useCallback(
        (payload) => dispatch(highlightFeature(payload)),
        [dispatch]
    )
    const debouncedHighlightFeature = useDebouncedHighlightFeature(
        dispatchHighlightFeature
    )

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
                selection={selection}
                highlightColor={highlightColor}
                selectionFilter={selectionFilter}
                highlightFeature={debouncedHighlightFeature}
                clickFeature={(payload) => dispatch(clickFeature(payload))}
                toggleFeatureSelection={(id, layerId) =>
                    dispatch(toggleFeatureSelection(id, layerId))
                }
                openContextMenu={(config) => dispatch(openContextMenu(config))}
                coordinatePopup={coordinatePopup}
                interpretationModalOpen={interpretationModalOpen}
                closeCoordinatePopup={() => dispatch(closeCoordinatePopup())}
                setAggregations={(data) => dispatch(setAggregations(data))}
                setFeatureProfile={(val) => dispatch(setFeatureProfile(val))}
                resizeCount={resizeCount}
                setMapObject={setMap}
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
