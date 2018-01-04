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
        const { layer, loadLayer } = this.props;

        if (layer && layer.layer === 'external') { // External layers has no edit widget
            loadLayer({ ...layer });
        }
    }

    loadLayer() {
        const { layer, loadLayer } = this.props;

        if (this.layerContainer.getWrappedInstance().validate()) { // TODO: Better pattern?
            loadLayer({
                ...layer,
                isLoaded: false,
                editCounter: layer.editCounter === undefined ? 0 : ++layer.editCounter,
            });

            this.closeDialog();
        }
    }

    closeDialog() {
        this.props.cancelLayer();
    }

    render() {
        const { layer, loadLayer, cancelLayer } = this.props;

        if (!layer) {
            return null;
        }

        const LayerDialog = layerType[layer.layer];

        if (!LayerDialog) {
            return null;
            // reject('Unknown layer type.'); // TODO
        }

        return (
            <Dialog
                title={layer.title} // TODO: i18n
                bodyStyle={styles.body}
                titleStyle={styles.title}
                open={true}
                actions={[
                    <Button
                        color='primary'
                        onClick={() => cancelLayer()}
                        selector='cancel'
                    >{i18next.t('Cancel')}</Button>,
                    <Button
                        color='primary'
                        onClick={() => this.loadLayer()}
                        selector='update'
                    >{i18next.t(layer.id ? 'Update layer' : 'Add layer')}</Button>
                ]}
            >
                <LayerDialog
                    {...layer}
                    ref={container => this.layerContainer = container}
                />
            </Dialog>
        );
    }
}

export default connect(
    (state) => ({
        layer: state.layerEdit,
    }),
    { loadLayer, cancelLayer }
)(LayerEdit);
