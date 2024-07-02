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
import useLayerTypesVisibilityStore from '../../hooks/useLayerTypesVisibilityStore.js'
import EarthEngineLayer from './EarthEngineLayer.js'
import styles from './styles/EarthEngineModal.module.css'

const layers = earthEngineLayers
    .filter((l) => !l.legacy)
    .sort((a, b) => a.name.localeCompare(b.name))

const EarthEngineModal = ({ onClose }) => {
    const { visibleLayerTypes, showLayerType, hideLayerType } =
        useLayerTypesVisibilityStore()

    return (
        <Modal large position="middle" dataTest="earthenginemodal">
            <ModalTitle dataTest="earthenginemodal-title">
                {i18n.t('Configure available layers')}
            </ModalTitle>
            <ModalContent dataTest="earthenginemodal-content">
                <div className={styles.description}>
                    {i18n.t(
                        'Choose which layers are available to add to maps. This selection applies to all users.'
                    )}
                </div>
                {layers.map((layer) => (
                    <EarthEngineLayer
                        key={layer.layerId}
                        layer={layer}
                        isAdded={visibleLayerTypes.includes(layer.layerId)}
                        onShow={showLayerType}
                        onHide={hideLayerType}
                    />
                ))}
            </ModalContent>
            <ModalActions dataTest="earthenginemodal-actions">
                <ButtonStrip end>
                    <Button
                        dataTest="earthenginemodal-button"
                        secondary
                        onClick={() => onClose()}
                    >
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
