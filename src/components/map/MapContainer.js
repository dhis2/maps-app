import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MapView from './MapView';
import MapName from './MapName';
import MapLoadingMask from './MapLoadingMask';
import DownloadLegend from '../download/DownloadLegend';
import { openContextMenu, closeCoordinatePopup } from '../../actions/map';
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    INTERPRETATIONS_PANEL_WIDTH,
} from '../../constants/layout';

const styles = {
    container: {
        height: '100%',
        width: '100%',
    },
    download: {
        // Roboto font is not loaded by dom-to-image => switch to Arial
        '& div': {
            fontFamily: 'Arial,sans-serif!important',
        },
        '& .dhis2-map-timeline': {
            display: 'none',
        },
        '& .dhis2-map-period': {
            bottom: '10px!important',
        },
        '& .mapboxgl-compact': {
            padding: '0 5px',
            backgroundColor: 'hsla(0,0%,100%,.5)',
            margin: '0!important',
            minHeight: 0,
            borderRadius: 0,
        },
        '& .mapboxgl-ctrl-attrib-button': {
            display: 'none!important',
        },
        '& .mapboxgl-ctrl-attrib-inner': {
            display: 'block!important',
        },
    },
};

const MapContainer = props => {
    const {
        basemap,
        mapViews,
        bounds,
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
        classes,
    } = props;
    const [resizeCount, setResizeCount] = useState(0);

    const style = {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: layersPanelOpen ? LAYERS_PANEL_WIDTH : 0,
        right: interpretationsPanelOpen ? INTERPRETATIONS_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    };
    let className = classes.container;

    const layers = mapViews.filter(layer => layer.isLoaded);
    const isLoading = newLayerIsLoading || layers.length !== mapViews.length;

    if (isDownload) {
        className += ` ${classes.download} dhis2-map-download`;
    }

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
            <div id="dhis2-map-container" className={className}>
                <MapName />
                <MapView
                    isPlugin={false}
                    basemap={basemap}
                    layers={layers}
                    bounds={bounds}
                    openContextMenu={openContextMenu}
                    coordinatePopup={coordinatePopup}
                    closeCoordinatePopup={closeCoordinatePopup}
                    resizeCount={resizeCount}
                />
                {isDownload && legendPosition && layers.length && (
                    <DownloadLegend
                        position={legendPosition}
                        layers={layers}
                        showName={showName}
                    />
                )}
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
    classes: PropTypes.object.isRequired,
};

export default connect(
    ({ map, basemaps, download, dataTable, ui }) => ({
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
        ...ui,
    }),
    {
        openContextMenu,
        closeCoordinatePopup,
    }
)(withStyles(styles)(MapContainer));
