import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import i18next from 'i18next';
import Button from 'd2-ui/lib/button/Button';
import EventDialog from './EventDialog';
import FacilityDialog from './FacilityDialog';
import ThematicDialog from './thematic/ThematicDialog';
import BoundaryDialog from './BoundaryDialog';
import EarthEngineDialog from './EarthEngineDialog';
import { loadLayer, cancelLayer } from '../../actions/layers';

const layerType = {
    event: EventDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    boundary: BoundaryDialog,
    earthEngine: EarthEngineDialog,
};

const layerName = {
    event: 'event',
    facility: 'facility',
    thematic: 'thematic',
    boundary: 'boundary',
    earthEngine: 'Earth Engine',
};

const styles = {
    content: {
        minWidth: 400,
        maxWidth: 600,
    },
    title: {
        padding: '16px 24px 0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        padding: '0 24px',
        minHeight: 300,
    },
};

class LayerEdit extends Component {
    componentDidUpdate(prevProps) {
        const { layer, loadLayer } = this.props;

        if (layer && layer.layer === 'external') {
            // External layers has no edit widget
            loadLayer({ ...layer });
        }
    }

    loadLayer() {
        const { layer, loadLayer } = this.props;

        if (this.layerContainer.getWrappedInstance().validate()) {
            // TODO: Better pattern?
            loadLayer(layer);

            this.closeDialog();
        }
    }

    closeDialog() {
        this.props.cancelLayer();
    }

    render() {
        const { layer, cancelLayer } = this.props;

        if (!layer) {
            return null;
        }

        const type = layer.layer;
        const name = layerName[type];
        const LayerDialog = layerType[type];

        if (!LayerDialog) {
            return null;
        }

        const title = i18next.t(
            layer.id ? `Edit ${name} layer` : `Add new ${name} layer`
        );

        return (
            <Dialog
                title={title}
                contentStyle={styles.content}
                bodyStyle={styles.body}
                titleStyle={styles.title}
                open={true}
                actions={[
                    <Button
                        color="primary"
                        onClick={() => cancelLayer()}
                        selector="cancel"
                    >
                        {i18next.t('Cancel')}
                    </Button>,
                    <Button
                        color="primary"
                        onClick={() => this.loadLayer()}
                        selector="update"
                    >
                        {i18next.t(
                            layer.id
                                ? i18next.t('Update layer')
                                : i18next.t('Add layer')
                        )}
                    </Button>,
                ]}
            >
                <LayerDialog
                    {...layer}
                    ref={container => (this.layerContainer = container)}
                />
            </Dialog>
        );
    }
}

export default connect(
    state => ({
        layer: state.layerEdit,
    }),
    { loadLayer, cancelLayer }
)(LayerEdit);
