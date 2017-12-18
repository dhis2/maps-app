import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import i18next from 'i18next';
import Button from 'd2-ui/lib/button/Button';
import WidgetWindow from '../../app/WidgetWindow';
import EventDialog from './EventDialog';
import FacilityDialog from './FacilityDialog';
import ThematicDialog from './thematic/ThematicDialog';
import BoundaryDialog from './BoundaryDialog';
import EarthEngineDialog from './EarthEngineDialog';
import { getOverlay, cancelOverlay } from '../../actions/overlays';

const layerType = {
    event: EventDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    boundary: BoundaryDialog,
    earthEngine: EarthEngineDialog,
};

// Only create one widget per layer (will be changed when we switch to react)
const widgets = {};
const editCounter = {};

let nextOverlayId = 0;

const styles = {
    body: {
        padding: 0,
        minHeight: 300,
    },
    title: {
        padding: '8px 16px',
        fontSize: 18,
    },
};

class LayerEdit extends Component {

    componentDidUpdate(prevProps) {
        const { layer, getOverlay } = this.props;

        if (layer) {
            const config = { ...layer };
            let id = config.id;

            if (!id) { // New layer
                id = 'overlay-' + nextOverlayId++;
                config.id = id;
                config.isNew = true;
            } else {
                config.isNew = false;
            }

            if (config.type === 'external') { // External layers has no edit widget
                config.editCounter = 1;
                getOverlay(config);
            } else  if (config.old) { // TODO
                if (!widgets[id]) {
                    editCounter[id] = 0;

                    widgets[id] = WidgetWindow(gis, config, (editedLayer) => {
                        widgets[id].hide();
                        getOverlay(editedLayer);
                    });

                    if (config.isLoaded) { // Loaded as favorite
                        widgets[id].show();
                        console.log('####');
                        editCounter[id]++;
                        widgets[id].setLayer(config);
                    }
                } else {
                    config.isNew = false;
                }

                widgets[id].show();
            }
        }

    }

    addLayer() {
        const { layer, getOverlay } = this.props;

        const config = {
            ...layer,
            id: 'overlay-' + nextOverlayId++,
            isLoaded: false,
        };

        getOverlay(config);
        this.closeDialog();
    }

    updateLayer() {
        const { layer, getOverlay } = this.props;

        getOverlay({
            ...layer,
            isLoaded: false,
        });

        this.closeDialog();
    }

    closeDialog() {
        this.props.cancelOverlay();
    }

    onLayerChange(config) {
        this.config = config;
        // console.log('onLayerChange', config);
    }

    render() {
        const config = this.props.layer;

        if (!config || config.old) {
            return null;
        }

        const LayerDialog = layerType[config.type];

        if (!LayerDialog) {
            return null;
            // reject('Unknown layer type.'); // TODO
        }

        return (
            <Dialog
                title={config.title} // TODO: i18n
                bodyStyle={styles.body}
                titleStyle={styles.title}
                open={true}
                actions={[
                    <Button
                        color='primary'
                        onClick={() => this.closeDialog()}
                        selector='cancel'
                    >{i18next.t('Cancel')}</Button>,
                    (config.editCounter ?
                        <Button
                            color='primary'
                            onClick={() => this.updateLayer()}
                            selector='update'
                        >{i18next.t('Update layer')}</Button>
                    :
                        <Button
                            color='primary'
                            onClick={() => this.addLayer()}
                            selector='add'
                        >{i18next.t('Add layer')}</Button>
                    )
                ]}
            >
                <LayerDialog {...config} />
            </Dialog>
        );
    }
}

export default connect(
    (state) => ({
        layer: state.layerEdit,
    }),
    { getOverlay, cancelOverlay }
)(LayerEdit);
