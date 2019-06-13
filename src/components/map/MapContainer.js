import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Map from './Map';
import SplitView from './SplitView';
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
        '& .leaflet-control-zoom, & .leaflet-control-geocoder, & .leaflet-control-measure, & .leaflet-control-fit-bounds': {
            display: 'none!important',
        },
    },
});

const MapContainer = ({
    layersPanelOpen,
    interpretationsPanelOpen,
    dataTableOpen,
    dataTableHeight,
    isDownload,
    mapViews,
    classes,
}) => {
    const style = {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: layersPanelOpen ? LAYERS_PANEL_WIDTH : 0,
        right: interpretationsPanelOpen ? INTERPRETATIONS_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    };

    const splitViewLayer = mapViews.filter(
        view => view.periodDisplay === 'split'
    )[0];

    return (
        <div className={isDownload ? classes.mapDownload : null} style={style}>
            {splitViewLayer ? <SplitView layer={splitViewLayer} /> : <Map />}
        </div>
    );
};

MapContainer.propTypes = {
    dataTableOpen: PropTypes.bool,
    dataTableHeight: PropTypes.number,
    isDownload: PropTypes.bool,
    interpretationsPanelOpen: PropTypes.bool,
    layersPanelOpen: PropTypes.bool,
    mapViews: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(({ map, download, ui }) => ({
    splitView: map.splitView,
    mapViews: map.mapViews,
    isDownload: download.showDialog,
    ...ui,
}))(withStyles(styles)(MapContainer));
