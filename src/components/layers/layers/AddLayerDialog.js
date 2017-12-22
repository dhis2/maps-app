import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import LayerList from './LayerList'
import { editLayer, closeLayersDialog } from '../../../actions/layers';

const styles = {
    contentStyle: {
        width: 610,
        maxWidth: 'none',
    },
    bodyStyle: {
        overflowY: 'auto',
        padding: '0px 0px 0px 24px',
    },
};

const AddLayerDialog = ({ layersDialogOpen, layers, onRequestClose, onLayerSelect }) => {
    const actions = [
        <Button
            color='primary'
            onClick={onRequestClose}
        >Cancel</Button>,
    ];

    return (
        <Dialog
            title="Add new layer"
            actions={actions}
            modal={true}
            open={layersDialogOpen}
            contentStyle={styles.contentStyle}
            bodyStyle={styles.bodyStyle}
        >
            <LayerList
                layers={layers}
                onLayerSelect={onLayerSelect}
            />
        </Dialog>
    );
};

AddLayerDialog.propTypes = {
    layersDialogOpen: PropTypes.bool,
    layers: PropTypes.array,
    onRequestClose: PropTypes.func.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
};

AddLayerDialog.defaultProps = {
    layersDialogOpen: false,
    layers: [],
};

const mapStateToProps = (state) => ({
    layers: state.layers,
    layersDialogOpen: state.ui.layersDialogOpen,
});

const mapDispatchToProps = (dispatch) => ({
    onRequestClose: () => dispatch(closeOverlaysDialog()),
    onLayerSelect: layer => {

        dispatch(closeLayersDialog());
        dispatch(editLayer({
            ...layer,
            editCounter: 0,
        }));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddLayerDialog);
