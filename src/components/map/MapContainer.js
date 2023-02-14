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
import { getSplitViewLayer } from '../../util/helpers.js'
import DownloadLPanel from '../download/DownloadPanel.js'
import MapLoadingMask from './MapLoadingMask.js'
import MapName from './MapName.js'
import MapView from './MapView.js'
import styles from './styles/MapContainer.module.css'

const MapContainer = (props) => {
    const {
        mapViews,
        bounds,
        feature,
        newLayerIsLoading,
        coordinatePopup,
        layersPanelOpen,
        rightPanelOpen,
        dataTableOpen,
        dataTableHeight,
        interpretationModalOpen,
        downloadMode,
        openContextMenu,
        closeCoordinatePopup,
        setAggregations,
        showNorthArrow,
    } = props
    const [map, setMap] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const basemap = useBasemapConfig(props.basemap)

    const style = {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: layersPanelOpen || downloadMode ? LAYERS_PANEL_WIDTH : 0,
        right: rightPanelOpen ? RIGHT_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
        border: downloadMode ? 'var(--spacers-dp8) solid #ccc' : 'none',
    }

    const layers = mapViews.filter((layer) => layer.isLoaded)
    const isLoading = newLayerIsLoading || layers.length !== mapViews.length
    const isSplitView = !!getSplitViewLayer(layers)

    // Trigger map resize when panels are expanded, collapsed or dragged
    useEffect(() => {
        setResizeCount((count) => count + 1)
    }, [
        layersPanelOpen,
        rightPanelOpen,
        dataTableOpen,
        dataTableHeight,
        downloadMode,
    ])

    // Fit layer bounds when download mode is toggled
    useEffect(() => {
        if (map) {
            map.getMapGL().once('resize', () =>
                map.fitBounds(map.getLayersBounds(), {
                    padding: 40,
                })
            )
        }
    }, [map, downloadMode])

    return (
        <div style={style}>
            <div
                id="dhis2-map-container"
                data-test="dhis2-map-container"
                className={cx(styles.container, {
                    'dhis2-map-download': downloadMode,
                    [styles.download]: downloadMode,
                })}
            >
                <div
                    style={{
                        height: '100%',
                        width: downloadMode
                            ? `calc(100% - ${RIGHT_PANEL_WIDTH}px)`
                            : '100%',
                        backgroundColor: '#fff',
                    }}
                >
                    {!downloadMode && <MapName />}
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
                        showNorthArrow={showNorthArrow}
                        setMapObject={setMap}
                    />
                </div>
                {downloadMode && map && (
                    <DownloadLPanel
                        map={map.getMapGL()}
                        isSplitView={isSplitView}
                    />
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
    downloadMode: PropTypes.bool,
    feature: PropTypes.object,
    interpretationModalOpen: PropTypes.bool,
    layersPanelOpen: PropTypes.bool,
    mapViews: PropTypes.array,
    newLayerIsLoading: PropTypes.bool,
    rightPanelOpen: PropTypes.bool,
    showNorthArrow: PropTypes.bool,
}

export default connect(
    ({ map, download, dataTable, ui, feature, interpretation }) => ({
        basemap: map.basemap,
        newLayerIsLoading: map.newLayerIsLoading,
        coordinatePopup: map.coordinatePopup,
        mapViews: map.mapViews,
        bounds: map.bounds,
        downloadMode: download.downloadMode,
        showNorthArrow: download.downloadMode && download.showNorthArrow,
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
