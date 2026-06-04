import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    Button,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useCallback } from 'react'
import { MAPS_ADMIN_AUTHORITY_IDS } from '../../constants/settings.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import AddSourceWizard from './AddSourceWizard.jsx'
import LayerSourceCatalogue from './LayerSourceCatalogue.jsx'
import { mockCatalogueSources } from './mockCatalogueSources.js'
import { useFavorites } from './mockFavoritesStore.js'
import styles from './styles/ManageLayerSourcesModal.module.css'

const ManageLayerSourcesModal = ({ onClose, onAddToMap, initialMapType }) => {
    const { currentUser } = useCachedData()
    const isAdmin = MAPS_ADMIN_AUTHORITY_IDS.some((id) =>
        currentUser.authorities.has(id)
    )

    const [showWizard, setShowWizard] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingSource, setEditingSource] = useState(null)
    const [sources, setSources] = useState([...mockCatalogueSources])
    const [favorites, toggleFavorite] = useFavorites()
    const [pendingDeleteId, setPendingDeleteId] = useState(null)

    const handleEscape = useCallback(() => {
        if (showWizard) {
            setShowWizard(false)
            setIsEditMode(false)
            setEditingSource(null)
        } else {
            onClose()
        }
    }, [showWizard, onClose])

    useKeyDown('Escape', handleEscape)

    const handleToggleFavorite = toggleFavorite

    const handleAddToMap = (source) => {
        if (onAddToMap) {
            onAddToMap(source)
        }
        onClose()
    }

    const handleDeleteSource = (id) => {
        setPendingDeleteId(id)
    }

    const handleConfirmDelete = () => {
        const id = pendingDeleteId
        setSources((prev) => prev.filter((s) => s.id !== id))
        if (favorites.has(id)) {
            toggleFavorite(id)
        }
        setPendingDeleteId(null)
    }

    const handleCancelDelete = () => {
        setPendingDeleteId(null)
    }

    const handleEditSource = (source) => {
        setEditingSource(source)
        setIsEditMode(true)
        setShowWizard(true)
    }

    const handleWizardBack = () => {
        setShowWizard(false)
        setIsEditMode(false)
        setEditingSource(null)
    }

    const wizardTitle = isEditMode
        ? i18n.t('Edit layer source')
        : i18n.t('Add layer source')

    return (
        <>
            <Modal
                onClose={onClose}
                position="top"
                fluid
                dataTest="managelayersourcesmodal"
            >
                <ModalContent dataTest="managelayersourcesmodal-content">
                    <div className={styles.content}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {showWizard
                                    ? wizardTitle
                                    : i18n.t('Layer sources')}
                            </h2>
                            {isAdmin && (
                                <Button
                                    primary
                                    small
                                    style={
                                        showWizard
                                            ? { visibility: 'hidden' }
                                            : undefined
                                    }
                                    onClick={() => {
                                        setIsEditMode(false)
                                        setShowWizard(true)
                                    }}
                                >
                                    + {i18n.t('Add source')}
                                </Button>
                            )}
                        </div>

                        <div className={styles.viewWrapper}>
                            {showWizard ? (
                                <AddSourceWizard
                                    isAdmin={isAdmin}
                                    isEdit={isEditMode}
                                    editSource={editingSource}
                                    onBack={handleWizardBack}
                                    onCancel={handleWizardBack}
                                />
                            ) : (
                                <LayerSourceCatalogue
                                    sources={sources}
                                    favorites={favorites}
                                    initialMapType={initialMapType}
                                    onToggleFavorite={handleToggleFavorite}
                                    onAddToMap={handleAddToMap}
                                    onEditSource={
                                        isAdmin ? handleEditSource : undefined
                                    }
                                    onDeleteSource={
                                        isAdmin ? handleDeleteSource : undefined
                                    }
                                />
                            )}
                        </div>
                    </div>
                </ModalContent>
            </Modal>

            {pendingDeleteId && (
                <Modal
                    small
                    position="middle"
                    onClose={handleCancelDelete}
                    dataTest="delete-source-confirm-modal"
                >
                    <ModalTitle>{i18n.t('Delete layer source')}</ModalTitle>
                    <ModalContent>
                        {i18n.t(
                            'This layer source will be permanently removed from the catalogue. Continue?'
                        )}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button secondary onClick={handleCancelDelete}>
                                {i18n.t('Cancel')}
                            </Button>
                            <Button destructive onClick={handleConfirmDelete}>
                                {i18n.t('Delete')}
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </>
    )
}

ManageLayerSourcesModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    initialMapType: PropTypes.string,
    onAddToMap: PropTypes.func,
}

export default ManageLayerSourcesModal
