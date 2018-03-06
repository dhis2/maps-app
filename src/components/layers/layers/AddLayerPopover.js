import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover';
import LayerList from './LayerList';
import {
    addLayer,
    editLayer,
    closeLayersDialog,
} from '../../../actions/layers';

const AddLayerPopover = ({
    anchorEl,
    layersDialogOpen,
    layers,
    onRequestClose,
    onLayerSelect,
}) => (
    <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={onRequestClose}
        open={layersDialogOpen}
    >
        <LayerList layers={layers} onLayerSelect={onLayerSelect} />
    </Popover>
);

AddLayerPopover.propTypes = {
    layersDialogOpen: PropTypes.bool,
    layers: PropTypes.array,
    onRequestClose: PropTypes.func.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
};

AddLayerPopover.defaultProps = {
    layersDialogOpen: false,
    layers: [],
};

const mapStateToProps = state => ({
    layers: state.layers,
    layersDialogOpen: state.ui.layersDialogOpen,
});

const mapDispatchToProps = dispatch => ({
    onRequestClose: () => dispatch(closeLayersDialog()),
    onLayerSelect: layer => {
        if (layer.type === 'external') {
            dispatch(addLayer({ ...layer, isLoaded: true }));
        } else {
            dispatch(editLayer({ ...layer }));
        }

        dispatch(closeLayersDialog());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddLayerPopover);
