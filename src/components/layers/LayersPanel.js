import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import BasemapCard from '../layers/basemaps/BasemapCard';
import OverlayCard from '../layers/overlays/OverlayCard';
import { requestOverlayLoad, sortOverlays } from '../../actions/overlays';
import { HEADER_HEIGHT, LAYERS_PANEL_WIDTH } from '../../constants/layout';

const SortableLayer = SortableElement(OverlayCard);

// Draggable layers - last layer on top
const SortableLayersList = SortableContainer(({ overlays }) => (
    <div style={{ zIndex: 3000 }}>
        {overlays.map((overlay, index) => (
            <SortableLayer
                key={overlay.id}
                index={index}
                layer={overlay}
            />
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
};

const LayersPanel = ({ layersPanelOpen, basemap, basemaps, overlays, sortOverlays }) => (
    <Drawer
        open={layersPanelOpen}
        containerStyle={style}
        width={LAYERS_PANEL_WIDTH}
    >
        <SortableLayersList
            overlays={overlays}
            onSortEnd={sortOverlays}
            useDragHandle={true}
        />
        <BasemapCard
            {...basemap}
            basemaps={basemaps}
        />
    </Drawer>
);

LayersPanel.propTypes = {
    layersPanelOpen: PropTypes.bool.isRequired,
    basemap: PropTypes.object.isRequired,
    basemaps: PropTypes.array.isRequired,
    overlays: PropTypes.array.isRequired,
    sortOverlays: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    basemap: {
        ...state.basemaps.filter(b => b.id === state.map.basemap.id)[0],
        ...state.map.basemap,
    },
    overlays: state.map.overlays,
    basemaps: state.basemaps,
    layersPanelOpen: state.ui.layersPanelOpen,
});

export default connect(
    mapStateToProps,
    { requestOverlayLoad, sortOverlays }
)(LayersPanel);
