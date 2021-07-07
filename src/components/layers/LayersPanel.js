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

const LayersPanel = ({
    layersPanelOpen,
    basemap,
    basemaps,
    layers,
    sortLayers,
}) =>
    layersPanelOpen && (
        <Drawer position="left">
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
