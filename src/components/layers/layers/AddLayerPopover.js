import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import Popover from 'material-ui/Popover';
import Button from 'd2-ui/lib/button/Button';
import LayerList from './LayerList'
import { editLayer, closeLayersDialog } from '../../../actions/layers';

const AddLayerPopover = ({ anchorEl, layersDialogOpen, layers, onRequestClose, onLayerSelect }) => (
    <Popover
        anchorEl={anchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={onRequestClose}
        open={layersDialogOpen}
    >
        <LayerList
            layers={layers}
            onLayerSelect={onLayerSelect}
        />
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

const mapStateToProps = (state) => ({
    layers: state.layers,
    layersDialogOpen: state.ui.layersDialogOpen,
});

const mapDispatchToProps = (dispatch) => ({
    onRequestClose: () => dispatch(closeLayersDialog()),
    onLayerSelect: layer => {

        dispatch(closeLayersDialog());
        dispatch(editLayer({
            ...layer,
            editCounter: 0,
        }));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddLayerPopover);
