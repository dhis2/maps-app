import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import OverlayList from './OverlayList'
import { editOverlay, closeOverlaysDialog } from '../../../actions/overlays';

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

const AddLayerDialog = ({ overlaysDialogOpen, overlays, onRequestClose, onLayerSelect }) => {
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
            open={overlaysDialogOpen}
            contentStyle={styles.contentStyle}
            bodyStyle={styles.bodyStyle}
        >
            <OverlayList
                overlays={overlays}
                onLayerSelect={onLayerSelect}
            />
        </Dialog>
    );
};

AddLayerDialog.propTypes = {
    layersDialogOpen: PropTypes.bool,
    overlays: PropTypes.array,
    onRequestClose: PropTypes.func.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
};

AddLayerDialog.defaultProps = {
    layersDialogOpen: false,
    overlays: [],
};

const mapStateToProps = (state) => ({
    overlays: state.overlays,
    overlaysDialogOpen: state.ui.overlaysDialogOpen,
});

const mapDispatchToProps = (dispatch) => ({
    onRequestClose: () => dispatch(closeOverlaysDialog()),
    onLayerSelect: layer => {

        dispatch(closeOverlaysDialog());
        dispatch(editOverlay({
            ...layer,
            editCounter: 0,
        }));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddLayerDialog);
