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
    addLayer,
    editLayer,
    closeLayersDialog,
}) => {
    const onLayerSelect = layer => {
        layer.layer === 'external'
            ? addLayer({ ...layer, isLoaded: true })
            : editLayer({ ...layer });

        closeLayersDialog();
    };

    return (
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
            onClose={closeLayersDialog}
            open={layersDialogOpen}
            data-test="addlayerpopover"
        >
            <LayerList layers={layers} onLayerSelect={onLayerSelect} />
        </Popover>
    );
};

AddLayerPopover.propTypes = {
    anchorEl: PropTypes.instanceOf(Element),
    layersDialogOpen: PropTypes.bool,
    layers: PropTypes.array,
    addLayer: PropTypes.func.isRequired,
    editLayer: PropTypes.func.isRequired,
    closeLayersDialog: PropTypes.func.isRequired,
};

AddLayerPopover.defaultProps = {
    layersDialogOpen: false,
    layers: [],
};

export default connect(
    ({ layers, ui }) => ({
        layers,
        layersDialogOpen: ui.layersDialogOpen,
    }),
    { addLayer, editLayer, closeLayersDialog }
)(AddLayerPopover);
