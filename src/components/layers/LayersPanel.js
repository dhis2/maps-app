import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import BasemapCard from '../layers/basemaps/BasemapCard';
import LayerCard from './layers/LayerCard';
import { sortLayers } from '../../actions/layers';
import { HEADER_HEIGHT, LAYERS_PANEL_WIDTH } from '../../constants/layout';

const SortableLayer = SortableElement(LayerCard);

// Draggable layers - last layer on top
const SortableLayersList = SortableContainer(({ layers }) => (
    <div>
        {layers.map((layer, index) => (
            <SortableLayer key={layer.id} index={index} layer={layer} />
        ))}
    </div>
));

const styles = {
    panel: {
        top: HEADER_HEIGHT,
        backgroundColor: '#fafafa',
        boxShadow: '0 3px 10px 0 rgba(0, 0, 0, 0.227451)',
        height: 'auto',
        maxHeight: '100%',
        bottom: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        zIndex: 1190,
        width: LAYERS_PANEL_WIDTH,
    },
};

const LayersPanel = ({
    layersPanelOpen,
    basemap,
    basemaps,
    layers,
    sortLayers,
    classes,
}) => (
    <Drawer
        open={layersPanelOpen}
        variant="persistent"
        classes={{ paper: classes.panel }}
    >
        <SortableLayersList
            layers={layers}
            onSortEnd={sortLayers}
            useDragHandle={true}
        />
        <div>
            <BasemapCard {...basemap} basemaps={basemaps} />
        </div>
    </Drawer>
);

LayersPanel.propTypes = {
    layersPanelOpen: PropTypes.bool.isRequired,
    basemap: PropTypes.object.isRequired,
    basemaps: PropTypes.array.isRequired,
    layers: PropTypes.array.isRequired,
    sortLayers: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    basemap: {
        ...state.basemaps.filter(b => b.id === state.map.basemap.id)[0],
        ...state.map.basemap,
    },
    layers: [...state.map.mapViews].reverse(),
    basemaps: state.basemaps,
    layersPanelOpen: state.ui.layersPanelOpen,
});

export default connect(
    mapStateToProps,
    { sortLayers }
)(withStyles(styles)(LayersPanel));
