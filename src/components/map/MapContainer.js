import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';
import MapView from './MapView';
import MapName from './MapName';
import MapLoadingMask from './MapLoadingMask';
import DownloadLegend from '../download/DownloadLegend';
import { openContextMenu, closeCoordinatePopup } from '../../actions/map';
import { setAggregations } from '../../actions/aggregations';
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    INTERPRETATIONS_PANEL_WIDTH,
} from '../../constants/layout';
import styles from './styles/MapContainer.module.css';

const MapContainer = props => {
    const {
        basemap,
        mapViews,
        bounds,
        feature,
        showName,
        newLayerIsLoading,
        coordinatePopup,
        layersPanelOpen,
        interpretationsPanelOpen,
        dataTableOpen,
        dataTableHeight,
        isDownload,
        legendPosition,
        openContextMenu,
        closeCoordinatePopup,
        setAggregations,
    } = props;
    const [resizeCount, setResizeCount] = useState(0);

    const style = {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: layersPanelOpen ? LAYERS_PANEL_WIDTH : 0,
        right: interpretationsPanelOpen ? INTERPRETATIONS_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    };

    const layers = mapViews.filter(layer => layer.isLoaded);
    const isLoading = newLayerIsLoading || layers.length !== mapViews.length;

    // Trigger map resize when panels are expanded, collapsed or dragged
    useEffect(() => {
        setResizeCount(resizeCount + 1);
    }, [
        layersPanelOpen,
        interpretationsPanelOpen,
        dataTableOpen,
        dataTableHeight,
    ]);

    return (
        <div style={style}>
            <div
                id="dhis2-map-container"
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
                    closeCoordinatePopup={closeCoordinatePopup}
                    setAggregations={setAggregations}
                    resizeCount={resizeCount}
                />
                {isDownload && legendPosition && layers.length ? (
                    <DownloadLegend
                        position={legendPosition}
                        layers={layers}
                        showName={showName}
                    />
                ) : null}
                {isLoading && <MapLoadingMask />}
            </div>
        </div>
    );
};

MapContainer.propTypes = {
    basemap: PropTypes.object,
    mapViews: PropTypes.array,
    bounds: PropTypes.array,
    showName: PropTypes.bool,
    feature: PropTypes.object,
    newLayerIsLoading: PropTypes.bool,
    coordinatePopup: PropTypes.array,
    dataTableOpen: PropTypes.bool,
    dataTableHeight: PropTypes.number,
    isDownload: PropTypes.bool,
    legendPosition: PropTypes.string,
    interpretationsPanelOpen: PropTypes.bool,
    layersPanelOpen: PropTypes.bool,
    openContextMenu: PropTypes.func.isRequired,
    closeCoordinatePopup: PropTypes.func.isRequired,
    setAggregations: PropTypes.func.isRequired,
};

export default connect(
    ({ map, basemaps, download, dataTable, ui, feature }) => ({
        basemap: {
            ...basemaps.filter(b => b.id === map.basemap.id)[0],
            ...map.basemap,
        },
        newLayerIsLoading: map.newLayerIsLoading,
        coordinatePopup: map.coordinatePopup,
        mapViews: map.mapViews,
        bounds: map.bounds,
        isDownload: download.showDialog,
        showName: download.showDialog ? download.showName : true,
        legendPosition: download.showLegend ? download.legendPosition : null,
        dataTableOpen: !!dataTable,
        feature,
        ...ui,
    }),
    {
        openContextMenu,
        closeCoordinatePopup,
        setAggregations,
    }
)(MapContainer);
