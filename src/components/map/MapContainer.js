import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Map from './Map';
import SplitView from './SplitView';
import MapName from './MapName';
import DownloadLegend from '../download/DownloadLegend';
import { openContextMenu, closeCoordinatePopup } from '../../actions/map';
import { mapControls } from '../../constants/mapControls';
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    INTERPRETATIONS_PANEL_WIDTH,
} from '../../constants/layout';

const styles = () => ({
    mapDownload: {
        // Roboto font is not loaded by dom-to-image => switch to Arial
        '& div': {
            fontFamily: 'Arial,sans-serif!important',
        },
    },
});

const MapContainer = ({
    basemap,
    mapViews,
    showName,
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
}) => {
    const style = {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: layersPanelOpen ? LAYERS_PANEL_WIDTH : 0,
        right: interpretationsPanelOpen ? INTERPRETATIONS_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    };
    let className = '';

    const splitViewLayer = mapViews.find(
        view => view.renderingStrategy === 'SPLIT_BY_PERIOD'
    );

    if (isDownload) {
        className = `dhis2-map-download ${classes.mapDownload}`;
    }

    const layers = [...mapViews.filter(layer => layer.isLoaded)].reverse();

    return (
        <div className={className} style={style}>
            <MapName />
            {splitViewLayer ? (
                <SplitView
                    layer={splitViewLayer}
                    basemap={basemap}
                    openContextMenu={openContextMenu}
                />
            ) : (
                <Map
                    basemap={basemap}
                    layers={layers}
                    controls={mapControls}
                    coordinatePopup={coordinatePopup}
                    closeCoordinatePopup={closeCoordinatePopup}
                    openContextMenu={openContextMenu}
                />
            )}
            {isDownload && legendPosition && (
                <DownloadLegend
                    position={legendPosition}
                    layers={layers}
                    showName={showName}
                />
            )}
        </div>
    );
};

MapContainer.propTypes = {
    basemap: PropTypes.object,
    mapViews: PropTypes.array,
    showName: PropTypes.bool,
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
    ({ map, basemaps, download, ui }) => ({
        basemap: {
            ...basemaps.filter(b => b.id === map.basemap.id)[0],
            ...map.basemap,
        },
        coordinatePopup: map.coordinatePopup,
        mapViews: map.mapViews,
        isDownload: download.showDialog,
        showName: download.showDialog ? download.showName : true,
        legendPosition: download.showLegend ? download.legendPosition : null,
        ...ui,
    }),
    {
        openContextMenu,
        closeCoordinatePopup,
    }
)(withStyles(styles)(MapContainer));
