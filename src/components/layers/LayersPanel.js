import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import BasemapCard from '../layers/basemaps/BasemapCard';
import LayerCard from './layers/LayerCard';
import { sortLayers } from '../../actions/layers';
import { HEADER_HEIGHT, LAYERS_PANEL_WIDTH } from '../../constants/layout';

const SortableLayer = SortableElement(LayerCard);

// Draggable layers - last layer on top
const SortableLayersList = SortableContainer(({ layers }) => (
    <div style={{ zIndex: 3000 }}>
        {layers.map((layer, index) => (
            <SortableLayer key={layer.id} index={index} layer={layer} />
        ))}
    </div>
));

const style = {
    position: 'absolute',
    top: HEADER_HEIGHT,
    height: 'auto',
    bottom: 0,
    backgroundColor: '#fafafa',
    boxShadow: '0 3px 10px 0 rgba(0, 0, 0, 0.227451)',
    overflowX: 'hidden',
    overflowY: 'auto',
    zIndex: 1190,
};

const LayersPanel = ({
    layersPanelOpen,
    basemap,
    basemaps,
    layers,
    sortLayers,
}) => (
    <Drawer
        open={layersPanelOpen}
        containerStyle={style}
        width={LAYERS_PANEL_WIDTH}
    >
        <SortableLayersList
            layers={layers}
            onSortEnd={sortLayers}
            useDragHandle={true}
        />
        <BasemapCard {...basemap} basemaps={basemaps} />
    </Drawer>
);

LayersPanel.propTypes = {
    layersPanelOpen: PropTypes.bool.isRequired,
    basemap: PropTypes.object.isRequired,
    basemaps: PropTypes.array.isRequired,
    layers: PropTypes.array.isRequired,
    sortLayers: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { sortLayers })(LayersPanel);
