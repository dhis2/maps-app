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
import useKeyDown from '../../hooks/useKeyDown.js'
import { useOrgUnits } from '../OrgUnitsProvider.js'
import EarthEngineDialog from './earthEngine/EarthEngineDialog.js'
import EventDialog from './event/EventDialog.js'
import FacilityDialog from './FacilityDialog.js'
import GeoJsonDialog from './geoJson/GeoJsonDialog.js'
import OrgUnitDialog from './orgUnit/OrgUnitDialog.js'
import styles from './styles/LayerEdit.module.css'
import ThematicDialog from './thematic/ThematicDialog.js'
import TrackedEntityDialog from './trackedEntity/TrackedEntityDialog.js'

const layerDialogs = {
    event: EventDialog,
    trackedEntity: TrackedEntityDialog,
    facility: FacilityDialog,
    thematic: ThematicDialog,
    orgUnit: OrgUnitDialog,
    earthEngine: EarthEngineDialog,
    geoJsonUrl: GeoJsonDialog,
}

const getLayerNames = () => ({
    event: i18n.t('event'),
    trackedEntity: i18n.t('tracked entity'),
    facility: i18n.t('facility'),
    thematic: i18n.t('thematic'),
    orgUnit: i18n.t('org unit'),
    earthEngine: i18n.t('Earth Engine'),
    geoJsonUrl: i18n.t('feature'),
})

const LayerEdit = ({ layer, addLayer, updateLayer, cancelLayer }) => {
    const [isValidLayer, setIsValidLayer] = useState(false)
    const { systemSettings, periodsSettings } = useCachedDataQuery()
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

    useKeyDown('Escape', cancelLayer)
    useKeyDown('Enter', onValidateLayer)

    if (!layer) {
        return null
    }

    const type = layer.layer
    const LayerDialog = layerDialogs[type]

    if (!LayerDialog) {
        return null
    }

    let name = getLayerNames()[type]

    if (type === EARTH_ENGINE_LAYER) {
        name = layer.name.toLowerCase()
    }

    const title = layer.id
        ? i18n.t('Edit {{name}} layer', { name })
        : i18n.t('Add new {{name}} layer', { name })

    return (
        <Modal position="middle" dataTest="layeredit" large>
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>
                <div className={styles.content}>
                    <LayerDialog
                        {...layer}
                        systemSettings={systemSettings}
                        periodsSettings={periodsSettings}
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
