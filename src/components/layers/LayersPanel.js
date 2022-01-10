import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Drawer from '../core/Drawer';
import BasemapCard from '../layers/basemaps/BasemapCard';
import OverlayCard from './overlays/OverlayCard';
import { sortLayers } from '../../actions/layers';

const SortableLayer = SortableElement(OverlayCard);

// Draggable layers - last layer on top
const SortableLayersList = SortableContainer(({ layers }) => (
    <div>
        {layers.map((layer, index) => (
            <SortableLayer key={layer.id} index={index} layer={layer} />
        ))}
    </div>
));

const LayersPanel = ({ layersPanelOpen, layers, sortLayers }) =>
    layersPanelOpen && (
        <Drawer position="left">
            <SortableLayersList
                layers={layers}
                onSortEnd={sortLayers}
                useDragHandle={true}
            />
            <div>
                <BasemapCard />
            </div>
        </Drawer>
    );

LayersPanel.propTypes = {
    layersPanelOpen: PropTypes.bool.isRequired,
    layers: PropTypes.array.isRequired,
    sortLayers: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    layers: [...state.map.mapViews].reverse(),
    layersPanelOpen: state.ui.layersPanelOpen,
});

export default connect(mapStateToProps, { sortLayers })(LayersPanel);
