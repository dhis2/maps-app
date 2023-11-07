import { useCachedDataQuery } from '@dhis2/analytics'
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
import { addLayer, updateLayer, cancelLayer } from '../../actions/layers.js'
import { EARTH_ENGINE_LAYER } from '../../constants/layers.js'
import { useOrgUnits } from '../OrgUnitsProvider.js'
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
    event: i18n.t('Event'),
    trackedEntity: i18n.t('Tracked entity'),
    facility: i18n.t('Facility'),
    thematic: i18n.t('Thematic'),
    orgUnit: i18n.t('Org unit'),
})

const LayerEdit = ({ layer, addLayer, updateLayer, cancelLayer }) => {
    const [isValidLayer, setIsValidLayer] = useState(false)
    const { systemSettings } = useCachedDataQuery()
    const orgUnits = useOrgUnits()

    const onValidateLayer = () => setIsValidLayer(true)

    const onLayerValidation = (isValid) => {
        setIsValidLayer(false)
        if (isValid) {
            const { id, editCounter = 0 } = layer

            const config = {
                ...layer,
                editCounter: editCounter + 1,
                isLoaded: false,
                isLoading: false,
            }

            if (id) {
                updateLayer(config)
            } else {
                addLayer(config)
            }

            cancelLayer()
        }
    }

    if (!layer) {
        return null
    }

    const type = layer.layerType || layer.layer
    const LayerDialog = layerType[type]

    if (!LayerDialog) {
        return null
    }

    const name = type === EARTH_ENGINE_LAYER ? layer.name : layerName()[type]

    return (
        <Modal position="middle" dataTest="layeredit">
            <ModalTitle>{i18n.t('{{name}} layer', { name })}</ModalTitle>
            <ModalContent>
                <div className={styles.content}>
                    <LayerDialog
                        {...layer}
                        systemSettings={systemSettings}
                        orgUnits={orgUnits}
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
    addLayer: PropTypes.func.isRequired,
    cancelLayer: PropTypes.func.isRequired,
    updateLayer: PropTypes.func.isRequired,
    layer: PropTypes.object,
}

export default connect(
    ({ layerEdit }) => ({
        layer: layerEdit,
    }),
    { addLayer, updateLayer, cancelLayer }
)(LayerEdit)
