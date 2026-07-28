import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAggregations } from '../../actions/aggregations.js'
import { setActiveTimelinePeriod } from '../../actions/dataTable.js'
import {
    highlightFeature,
    setFeatureProfile,
    clickFeature,
} from '../../actions/feature.js'
import { openContextMenu, closeCoordinatePopup } from '../../actions/map.js'
import { toggleFeatureSelection } from '../../actions/selection.js'
import { COMBINED_TABLE_REF_LAYER } from '../../constants/layers.js'
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

    // The Combined data table's reference org unit layer is hidden and
    // never rendered on the map canvas - excluded from both the render
    // list and the isLoading count (comparing against the raw
    // mapViews.length here would leave isLoading permanently stuck true,
    // since a reference layer is never included in loadedMapViews).
    const renderableMapViews = mapViews.filter(
        (layer) => layer.layer !== COMBINED_TABLE_REF_LAYER
    )
    const loadedMapViews = renderableMapViews.filter((layer) => layer.isLoaded)
    const isLoading = loadedMapViews.length !== renderableMapViews.length

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
                setActiveTimelinePeriod={(period) =>
                    dispatch(setActiveTimelinePeriod(period))
                }
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
