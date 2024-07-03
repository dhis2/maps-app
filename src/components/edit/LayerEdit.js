import React, { useState } from 'react';
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
import OrgUnitDialog from './orgUnit/OrgUnitDialog';
import EarthEngineDialog from './earthEngine/EarthEngineDialog';
import { loadLayer, cancelLayer, setLayerLoading } from '../../actions/layers';
import { EARTH_ENGINE_LAYER } from '../../constants/layers';
import { useSystemSettings } from '../SystemSettingsProvider';
import { useSystemInfo } from '../SystemInfoProvider';
import { useUserSettings } from '../UserSettingsProvider';
import styles from './styles/LayerEdit.module.css';

const layerType = {
    event: EventDialog,
    trackedEntity: TrackedEntityDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    orgUnit: OrgUnitDialog,
    earthEngine: EarthEngineDialog,
};

const layerName = () => ({
    event: i18n.t('event'),
    trackedEntity: i18n.t('tracked entity'),
    facility: i18n.t('facility'),
    thematic: i18n.t('thematic'),
    orgUnit: i18n.t('org unit'),
    earthEngine: i18n.t('Earth Engine'),
});

const LayerEdit = ({ layer, cancelLayer, setLayerLoading, loadLayer }) => {
    const [isValidLayer, setIsValidLayer] = useState(false);
    const { keyAnalysisRelativePeriod } = useSystemSettings();
    const periodsSettings = {
        locale: useUserSettings().keyUiLocale,
        calendar: useSystemInfo().calendar,
    };

    const onValidateLayer = () => setIsValidLayer(true);

    const onLayerValidation = isValid => {
        setIsValidLayer(false);
        if (isValid) {
            const { id, editCounter = 0 } = layer;

            setLayerLoading(id);

            loadLayer({
                ...layer,
                editCounter: editCounter + 1,
            });
            cancelLayer();
        }
    };

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
                        defaultPeriod={keyAnalysisRelativePeriod}
                        periodsSettings={periodsSettings}
                        validateLayer={isValidLayer}
                        onLayerValidation={onLayerValidation}
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
                        onClick={onValidateLayer}
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
};

LayerEdit.propTypes = {
    layer: PropTypes.object,
    loadLayer: PropTypes.func.isRequired,
    cancelLayer: PropTypes.func.isRequired,
    setLayerLoading: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        layer: layerEdit,
    }),
    { loadLayer, cancelLayer, setLayerLoading }
)(LayerEdit);
