import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeFeatureProfile } from '../../actions/feature.js'
import { updateLayer } from '../../actions/layers.js'
import { openOsmEditForm, startOsmShapeEdit } from '../../actions/osmEdit.js'
import { eventToFeature } from '../../util/osm.js'
import {
    getOsmCategoryByProgram,
    OSM_GEOMETRY_LINE,
} from '../../util/osmCategories.js'
import { getRefreshedOsmLayers } from './osmLayer.js'
import {
    deleteOsmEvents,
    fetchFeaturePieces,
    fetchOsmEvent,
    getOsmErrorMessage,
} from './osmRequests.js'
import styles from './styles/OsmImport.module.css'

// Edit, shape and delete buttons in the feature profile of an OSM layer.
// A road is split per org unit: deleting it deletes all its pieces.
const OsmFeatureActions = ({ programId, eventId, geometry, name }) => {
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const mapViews = useSelector((state) => state.map.mapViews)
    const category = getOsmCategoryByProgram(programId)

    const [isConfirming, setIsConfirming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [pieceIds, setPieceIds] = useState()
    const [error, setError] = useState()

    if (!category) {
        return null
    }

    const isLine = category.geometry === OSM_GEOMETRY_LINE
    // The drawing tool edits single lines only
    const canEditShape = geometry?.type !== 'MultiLineString'

    const onAskDelete = async () => {
        setIsConfirming(true)
        setError(null)
        setPieceIds(null)
        try {
            if (!isLine) {
                setPieceIds([eventId])
                return
            }
            const event = await fetchOsmEvent(engine, eventId)
            const pieces = await fetchFeaturePieces(
                engine,
                programId,
                eventToFeature(event)
            )
            setPieceIds(pieces.map((piece) => piece.event))
        } catch (e) {
            setError(getOsmErrorMessage(e))
        }
    }

    const onDelete = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            await deleteOsmEvents(engine, pieceIds)
            const layers = await getRefreshedOsmLayers(
                engine,
                mapViews,
                programId
            )
            layers.forEach((layer) => dispatch(updateLayer(layer)))
            dispatch(closeFeatureProfile())
        } catch (e) {
            setError(getOsmErrorMessage(e))
            setIsDeleting(false)
        }
    }

    return (
        <div className={styles.actions}>
            <ButtonStrip>
                <Button
                    small
                    onClick={() =>
                        dispatch(openOsmEditForm(category.id, eventId))
                    }
                >
                    {i18n.t('Edit')}
                </Button>
                {canEditShape && (
                    <Button
                        small
                        onClick={() => {
                            // The panel would cover the map while drawing
                            dispatch(closeFeatureProfile())
                            dispatch(
                                startOsmShapeEdit(
                                    category.id,
                                    eventId,
                                    geometry
                                )
                            )
                        }}
                    >
                        {isLine ? i18n.t('Edit shape') : i18n.t('Move')}
                    </Button>
                )}
                <Button small destructive onClick={onAskDelete}>
                    {i18n.t('Delete')}
                </Button>
            </ButtonStrip>
            {isConfirming && (
                <Modal small onClose={() => setIsConfirming(false)}>
                    <ModalTitle>{i18n.t('Delete feature')}</ModalTitle>
                    <ModalContent>
                        {error && (
                            <NoticeBox error className={styles.error}>
                                {error}
                            </NoticeBox>
                        )}
                        {i18n.t(
                            'Delete {{- name}} from DHIS2? OpenStreetMap is not changed, so an imported feature comes back with the next import.',
                            { name }
                        )}
                        {pieceIds?.length > 1 && (
                            <p>
                                {i18n.t(
                                    'This road is saved in {{count}} org units, it will be deleted in all of them.',
                                    { count: pieceIds.length }
                                )}
                            </p>
                        )}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button
                                secondary
                                onClick={() => setIsConfirming(false)}
                            >
                                {i18n.t('Cancel')}
                            </Button>
                            <Button
                                destructive
                                loading={isDeleting}
                                disabled={!pieceIds}
                                onClick={onDelete}
                            >
                                {i18n.t('Delete')}
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </div>
    )
}

OsmFeatureActions.propTypes = {
    eventId: PropTypes.string.isRequired,
    programId: PropTypes.string.isRequired,
    geometry: PropTypes.object,
    name: PropTypes.string,
}

export default OsmFeatureActions
