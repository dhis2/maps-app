import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui';
import EventDialog from './event/EventDialog';
import TrackedEntityDialog from './trackedEntity/TrackedEntityDialog';
import FacilityDialog from './FacilityDialog';
import ThematicDialog from './thematic/ThematicDialog';
import BoundaryDialog from './BoundaryDialog';
import EarthEngineDialog from './earthEngine/EarthEngineDialog';
import { loadLayer, cancelLayer, setLayerLoading } from '../../actions/layers';
import { EARTH_ENGINE_LAYER } from '../../constants/layers';
import styles from './styles/LayerEdit.module.css';

const layerType = {
    event: EventDialog,
    trackedEntity: TrackedEntityDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    boundary: BoundaryDialog,
    earthEngine: EarthEngineDialog,
};

const layerName = () => ({
    event: i18n.t('event'),
    trackedEntity: i18n.t('tracked entity'),
    facility: i18n.t('facility'),
    thematic: i18n.t('thematic'),
    boundary: i18n.t('boundary'),
    earthEngine: i18n.t('Earth Engine'),
});

class LayerEdit extends Component {
    static propTypes = {
        layer: PropTypes.object,
        defaultPeriod: PropTypes.string,
        loadLayer: PropTypes.func.isRequired,
        cancelLayer: PropTypes.func.isRequired,
        setLayerLoading: PropTypes.func.isRequired,
    };

    state = {
        validateLayer: false,
    };

    closeDialog() {
        this.props.cancelLayer();
    }

    validateLayer() {
        this.setState({
            validateLayer: true,
        });
    }

    onLayerValidation = isValid => {
        this.setState({ validateLayer: false });
        if (isValid) {
            this.loadLayer();
            this.closeDialog();
        }
    };

    render() {
        const { layer, defaultPeriod, cancelLayer } = this.props;

        if (!layer) {
            return null;
        }

        const type = layer.layer;
        const LayerDialog = layerType[type];

        if (!LayerDialog) {
            return null;
        }

        let name = layerName()[type];

        if (type === EARTH_ENGINE_LAYER) {
            name = layer.name.toLowerCase();
        }

        const title = layer.id
            ? i18n.t('Edit {{name}} layer', { name })
            : i18n.t('Add new {{name}} layer', { name });

        return (
            <Modal position="middle" dataTest="layeredit">
                <ModalTitle>{title}</ModalTitle>
                <ModalContent>
                    <div className={styles.content}>
                        <LayerDialog
                            {...layer}
                            defaultPeriod={defaultPeriod}
                            validateLayer={this.state.validateLayer}
                            onLayerValidation={this.onLayerValidation}
                        />
                    </div>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button secondary onClick={cancelLayer}>
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            primary
                            onClick={() => this.validateLayer()}
                            dataTest="layeredit-addbtn"
                        >
                            {i18n.t(
                                layer.id
                                    ? i18n.t('Update layer')
                                    : i18n.t('Add layer')
                            )}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        );
    }

    loadLayer() {
        const { id, editCounter = 0 } = this.props.layer;

        this.props.setLayerLoading(id);

        this.props.loadLayer({
            ...this.props.layer,
            editCounter: editCounter + 1,
        });
    }
}

export default connect(
    ({ layerEdit, settings }) => ({
        layer: layerEdit,
        defaultPeriod: settings.system.keyAnalysisRelativePeriod,
    }),
    { loadLayer, cancelLayer, setLayerLoading }
)(LayerEdit);
