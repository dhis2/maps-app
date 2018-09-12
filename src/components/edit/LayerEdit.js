import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import EventDialog from './EventDialog';
import TrackedEntityDialog from './TrackedEntityDialog';
import FacilityDialog from './FacilityDialog';
import ThematicDialog from './thematic/ThematicDialog';
import BoundaryDialog from './BoundaryDialog';
import EarthEngineDialog from './EarthEngineDialog';
import { loadLayer, cancelLayer } from '../../actions/layers';

const layerType = {
    event: EventDialog,
    trackedEntity: TrackedEntityDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    boundary: BoundaryDialog,
    earthEngine: EarthEngineDialog,
};

const layerName = {
    event: 'event',
    trackedEntity: 'tracked entity',
    facility: 'facility',
    thematic: 'thematic',
    boundary: 'boundary',
    earthEngine: 'Earth Engine',
};

const styles = {
    paper: {
        width: 600,
    },
    title: {
        padding: '20px 24px 4px 24px',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: '0 24px',
        minHeight: 300,
    },
};

class LayerEdit extends Component {
    static propTypes = {
        layer: PropTypes.object,
        loadLayer: PropTypes.func.isRequired,
        cancelLayer: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    componentDidUpdate() {
        const { layer, loadLayer } = this.props;

        if (layer && layer.layer === 'external') {
            // External layers has no edit widget
            loadLayer({ ...layer });
        }
    }

    loadLayer() {
        const { layer, loadLayer } = this.props;

        // TODO: Better pattern?
        if (this.layerContainer.getWrappedInstance().validate()) {
            loadLayer(layer);
            this.closeDialog();
        }
    }

    closeDialog() {
        this.props.cancelLayer();
    }

    render() {
        const { layer, cancelLayer, classes } = this.props;

        if (!layer) {
            return null;
        }

        const type = layer.layer;
        const name = layerName[type];
        const LayerDialog = layerType[type];

        if (!LayerDialog) {
            return null;
        }

        const title = i18n.t(
            layer.id ? `Edit ${name} layer` : `Add new ${name} layer`
        );

        return (
            <Dialog open={true} classes={{ paper: classes.paper }}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {title}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <LayerDialog
                        {...layer}
                        ref={container => (this.layerContainer = container)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => cancelLayer()}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button color="primary" onClick={() => this.loadLayer()}>
                        {i18n.t(
                            layer.id
                                ? i18n.t('Update layer')
                                : i18n.t('Add layer')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(
    state => ({
        layer: state.layerEdit,
    }),
    { loadLayer, cancelLayer }
)(withStyles(styles)(LayerEdit));
