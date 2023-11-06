import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import React from 'react'
import { useDispatch } from 'react-redux'
import earthEngineLayers from './layers/index.js'
import useEarthEngineLayersStore from '../../hooks/useEarthEngineLayersStore'
import LayerRow from './LayerRow.js'
import styles from './styles/EarthEngineModal.module.css'

const layers = earthEngineLayers
    .filter((l) => !l.legacy)
    .sort((a, b) => a.name.localeCompare(b.name))

const EarthEngineModal = ({ onClose }) => {
    const { storedLayers, addLayer, removeLayer } = useEarthEngineLayersStore()
    const dispatch = useDispatch()

    return (
        <Modal large position="middle" dataTest="earthenginemodal">
            <ModalTitle>{i18n.t('Manage available layers')}</ModalTitle>
            <ModalContent>
                <div className={styles.description}>
                    {i18n.t(
                        'Select the layers you want to show in the "Add layer" dialogue. The shown layers will be available for all users.'
                    )}
                </div>
                <table className={styles.layersTable}>
                    <tbody>
                        {layers.map((layer) => (
                            <LayerRow
                                key={layer.layerId}
                                layer={layer}
                                isAdded={storedLayers.includes(layer.layerId)}
                                onShow={addLayer}
                                onHide={removeLayer}
                            />
                        ))}
                    </tbody>
                </table>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={() => onClose()}>
                        {i18n.t('Close')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export default EarthEngineModal
