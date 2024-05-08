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
import React from 'react'
import earthEngineLayers from '../../constants/earthEngineLayers/index.js'
import useEarthEngineLayers from '../../hooks/useEarthEngineLayersStore.js'
import EarthEngineLayer from './EarthEngineLayer.js'
import styles from './styles/EarthEngineModal.module.css'

const layers = earthEngineLayers
    .filter((l) => !l.legacy)
    .sort((a, b) => a.name.localeCompare(b.name))

const EarthEngineModal = ({ onClose }) => {
    const { addedLayers, addLayer, removeLayer } = useEarthEngineLayers()

    return (
        <Modal large position="middle" dataTest="earthenginemodal">
            <ModalTitle>{i18n.t('Configure available layers')}</ModalTitle>
            <ModalContent>
                <div className={styles.description}>
                    {i18n.t(
                        'Choose which layers are available to add to maps. This setting applies to all users.'
                    )}
                </div>
                {layers.map((layer) => (
                    <EarthEngineLayer
                        key={layer.layerId}
                        layer={layer}
                        isAdded={addedLayers.includes(layer.layerId)}
                        onShow={addLayer}
                        onHide={removeLayer}
                    />
                ))}
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

EarthEngineModal.propTypes = {
    onClose: PropTypes.func.isRequired,
}

export default EarthEngineModal
