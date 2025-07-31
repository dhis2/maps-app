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
import useKeyDown from '../../hooks/useKeyDown.js'
import useManagedLayerSourcesStore from '../../hooks/useManagedLayerSourcesStore.js'
import LayerSource from './LayerSource.jsx'
import styles from './styles/ManageLayerSourcesModal.module.css'

const nonLegacyEarthEngineLayers = earthEngineLayers
    .filter((l) => !l.legacy)
    .sort((a, b) => a.name.localeCompare(b.name))
const layerSources = [...nonLegacyEarthEngineLayers]

const ManageLayerSourcesModal = ({ onClose }) => {
    const { managedLayerSources, showLayerSource, hideLayerSource } =
        useManagedLayerSourcesStore()

    useKeyDown('Escape', onClose)

    return (
        <Modal
            onClose={onClose}
            large
            position="middle"
            dataTest="managelayersourcesmodal"
        >
            <ModalTitle dataTest="managelayersourcesmodal-title">
                {i18n.t('Configure available layer sources')}
            </ModalTitle>
            <ModalContent dataTest="managelayersourcesmodal-content">
                <div className={styles.description}>
                    {i18n.t(
                        'Choose which layer sources are available to add to maps. This selection applies to all users.'
                    )}
                </div>
                {layerSources.map((layerSource) => (
                    <LayerSource
                        key={layerSource.layerId}
                        layerSource={layerSource}
                        isAdded={managedLayerSources.includes(
                            layerSource.layerId
                        )}
                        onShow={showLayerSource}
                        onHide={hideLayerSource}
                    />
                ))}
            </ModalContent>
            <ModalActions dataTest="managelayersourcesmodal-actions">
                <ButtonStrip end>
                    <Button
                        dataTest="managelayersourcesmodal-button"
                        secondary
                        onClick={onClose}
                    >
                        {i18n.t('Close')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

ManageLayerSourcesModal.propTypes = {
    onClose: PropTypes.func.isRequired,
}

export default ManageLayerSourcesModal
