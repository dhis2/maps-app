import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setAggregations } from '../../actions/aggregations.js'
import { openContextMenu, closeCoordinatePopup } from '../../actions/map.js'
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import DownloadLegend from '../download/DownloadLegend.js'
import MapLoadingMask from './MapLoadingMask.js'
import MapName from './MapName.js'
import MapView from './MapView.js'
import styles from './styles/MapContainer.module.css'

const MapContainer = (props) => {
    const {
        mapViews,
        bounds,
        feature,
        showName,
        newLayerIsLoading,
        coordinatePopup,
        layersPanelOpen,
        rightPanelOpen,
        dataTableOpen,
        dataTableHeight,
        interpretationModalOpen,
        isDownload,
        openContextMenu,
        closeCoordinatePopup,
        setAggregations,
    } = props
    const [resizeCount, setResizeCount] = useState(0)
    const basemap = useBasemapConfig(props.basemap)

    const style = {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: layersPanelOpen ? LAYERS_PANEL_WIDTH : 0,
        right: rightPanelOpen ? RIGHT_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    }

    const layers = mapViews.filter((layer) => layer.isLoaded)
    const isLoading = newLayerIsLoading || layers.length !== mapViews.length

    // Trigger map resize when panels are expanded, collapsed or dragged
    useEffect(() => {
        setResizeCount((count) => count + 1)
    }, [layersPanelOpen, rightPanelOpen, dataTableOpen, dataTableHeight])

    return (
        <div style={style}>
            <div
                id="dhis2-map-container"
                data-test="dhis2-map-container"
                className={cx(styles.container, {
                    'dhis2-map-download': isDownload,
                    [styles.download]: isDownload,
                })}
            >
                <MapName />
                <MapView
                    isPlugin={false}
                    basemap={basemap}
                    layers={layers}
                    bounds={bounds}
                    feature={feature}
                    openContextMenu={openContextMenu}
                    coordinatePopup={coordinatePopup}
                    interpretationModalOpen={interpretationModalOpen}
                    closeCoordinatePopup={closeCoordinatePopup}
                    setAggregations={setAggregations}
                    resizeCount={resizeCount}
                />
                {isDownload && layers.length && (
                    <DownloadLegend layers={layers} showName={showName} />
                )}
                {isLoading && <MapLoadingMask />}
            </div>
        </div>
    )
}

MapContainer.propTypes = {
    closeCoordinatePopup: PropTypes.func.isRequired,
    openContextMenu: PropTypes.func.isRequired,
    setAggregations: PropTypes.func.isRequired,
    basemap: PropTypes.object,
    bounds: PropTypes.array,
    coordinatePopup: PropTypes.array,
    dataTableHeight: PropTypes.number,
    dataTableOpen: PropTypes.bool,
    feature: PropTypes.object,
    interpretationModalOpen: PropTypes.bool,
    isDownload: PropTypes.bool,
    layersPanelOpen: PropTypes.bool,
    legendPosition: PropTypes.string,
    mapViews: PropTypes.array,
    newLayerIsLoading: PropTypes.bool,
    rightPanelOpen: PropTypes.bool,
    showName: PropTypes.bool,
}

export default connect(
    ({ map, download, dataTable, ui, feature, interpretation }) => ({
        basemap: map.basemap,
        newLayerIsLoading: map.newLayerIsLoading,
        coordinatePopup: map.coordinatePopup,
        mapViews: map.mapViews,
        bounds: map.bounds,
        isDownload: download.downloadMode,
        showName: download.downloadMode ? download.showName : true,
        legendPosition: download.showLegend ? download.legendPosition : null,
        dataTableOpen: !!dataTable,
        interpretationModalOpen: !!interpretation.id,
        feature,
        ...ui,
    }),
    {
        openContextMenu,
        closeCoordinatePopup,
        setAggregations,
    }
)(MapContainer)
