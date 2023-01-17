import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    loadLayer,
    cancelLayer,
    setLayerLoading,
} from '../../actions/layers.js'
import { EARTH_ENGINE_LAYER } from '../../constants/layers.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import EarthEngineDialog from './earthEngine/EarthEngineDialog.js'
import EventDialog from './event/EventDialog.js'
import FacilityDialog from './FacilityDialog.js'
import OrgUnitDialog from './orgUnit/OrgUnitDialog.js'
import styles from './styles/LayerEdit.module.css'
import ThematicDialog from './thematic/ThematicDialog.js'
import TrackedEntityDialog from './trackedEntity/TrackedEntityDialog.js'

const layerType = {
    event: EventDialog,
    trackedEntity: TrackedEntityDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    orgUnit: OrgUnitDialog,
    earthEngine: EarthEngineDialog,
}

const layerName = () => ({
    event: i18n.t('event'),
    trackedEntity: i18n.t('tracked entity'),
    facility: i18n.t('facility'),
    thematic: i18n.t('thematic'),
    orgUnit: i18n.t('org unit'),
    earthEngine: i18n.t('Earth Engine'),
})

const LayerEdit = ({ layer, cancelLayer, setLayerLoading, loadLayer }) => {
    const [isValidLayer, setIsValidLayer] = useState(false)
    const { keyAnalysisRelativePeriod } = useSystemSettings()

    const onValidateLayer = () => setIsValidLayer(true)

    const onLayerValidation = (isValid) => {
        setIsValidLayer(false)
        if (isValid) {
            const { id, editCounter = 0 } = layer

            setLayerLoading(id)

            loadLayer({
                ...layer,
                editCounter: editCounter + 1,
            })
            cancelLayer()
        }
    }

    if (!layer) {
        return null
    }

    const type = layer.layer
    const LayerDialog = layerType[type]

    if (!LayerDialog) {
        return null
    }

    let name = layerName()[type]

    if (type === EARTH_ENGINE_LAYER) {
        name = layer.name.toLowerCase()
    }

    const title = layer.id
        ? i18n.t('Edit {{name}} layer', { name })
        : i18n.t('Add new {{name}} layer', { name })

    return (
        <Modal position="middle" dataTest="layeredit">
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>
                <div className={styles.content}>
                    <LayerDialog
                        {...layer}
                        defaultPeriod={keyAnalysisRelativePeriod}
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
    )
}

LayerEdit.propTypes = {
    cancelLayer: PropTypes.func.isRequired,
    loadLayer: PropTypes.func.isRequired,
    setLayerLoading: PropTypes.func.isRequired,
    layer: PropTypes.object,
}

export default connect(
    ({ layerEdit }) => ({
        layer: layerEdit,
    }),
    { loadLayer, cancelLayer, setLayerLoading }
)(LayerEdit)
