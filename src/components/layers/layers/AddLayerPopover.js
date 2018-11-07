import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Popover from '@material-ui/core/Popover';
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
    onClose,
    onLayerSelect,
}) => (
    <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        onClose={onClose}
        open={layersDialogOpen}
    >
        <LayerList layers={layers} onLayerSelect={onLayerSelect} />
    </Popover>
);

AddLayerPopover.propTypes = {
    anchorEl: PropTypes.instanceOf(Element),
    layersDialogOpen: PropTypes.bool,
    layers: PropTypes.array,
    onClose: PropTypes.func.isRequired,
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
    onClose: () => dispatch(closeLayersDialog()),
    onLayerSelect: layer => {
        if (layer.layer === 'external') {
            dispatch(addLayer({ ...layer, isLoaded: true }));
        } else {
            dispatch(editLayer({ ...layer }));
        }

        dispatch(closeLayersDialog());
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddLayerPopover);
