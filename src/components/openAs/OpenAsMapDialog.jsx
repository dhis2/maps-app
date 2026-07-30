import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import log from 'loglevel'
import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { clearAnalyticalObject } from '../../actions/analyticalObject.js'
import { addLayer } from '../../actions/layers.js'
import getEarthEngineLayers from '../../constants/earthEngineLayers/index.js'
import { EARTH_ENGINE_LAYER } from '../../constants/layers.js'
import {
    CURRENT_AO_KEY,
    getDataDimensionsFromAnalyticalObject,
    getThematicLayerFromAnalyticalObject,
    getEarthEngineLayerFromAnalyticalObject,
} from '../../util/analyticalObject.js'
import { SelectField } from '../core/index.js'
import styles from './styles/OpenAsMapDialog.module.css'

const OpenAsMapDialog = () => {
    const dispatch = useDispatch()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const { type, layerId } = currentAO ?? {}
    const engine = useDataEngine()
    const allDataDimensions = getDataDimensionsFromAnalyticalObject(currentAO)
    const firstDimensionId = allDataDimensions[0]?.id

    const [selectedDataDims, setSelectedDataDims] = useState(() =>
        firstDimensionId ? [firstDimensionId] : []
    )
    const [isAdding, setIsAdding] = useState(false)

    // Adding always ends in clearAnalyticalObject(), which unmounts this
    // dialog, so the guard never needs resetting
    const hasAddedRef = useRef(false)

    const addLayersToMap = async () => {
        if (hasAddedRef.current) {
            return
        }
        hasAddedRef.current = true
        setIsAdding(true)

        try {
            const selectedDimensions = [...selectedDataDims].reverse()
            const lastDataId = selectedDimensions.at(-1)

            // Call in sequence
            for (const dataId of selectedDimensions) {
                const layer = await getThematicLayerFromAnalyticalObject({
                    ao: currentAO,
                    dataId,
                    isVisible: dataId === lastDataId,
                    engine,
                })

                if (layer) {
                    dispatch(addLayer(layer))
                }
            }
        } finally {
            dispatch(clearAnalyticalObject())
        }
    }

    const addEarthEngineLayerToMap = () => {
        if (hasAddedRef.current) {
            return
        }
        hasAddedRef.current = true

        const layerSource = getEarthEngineLayers().find(
            ({ layerId: id }) => layerId === id
        )
        const layer = getEarthEngineLayerFromAnalyticalObject({
            ao: currentAO,
        })

        if (layerSource && layer) {
            dispatch(
                addLayer({
                    ...layerSource,
                    aggregationType: layerSource.defaultAggregations,
                    ...layer,
                })
            )
        }

        dispatch(clearAnalyticalObject())
    }

    useEffect(() => {
        if (type === EARTH_ENGINE_LAYER) {
            if (!layerId) {
                log.info('No earth engine layer id found in analytical object')
                return
            }
            addEarthEngineLayerToMap()
            return
        }

        if (!allDataDimensions.length) {
            log.info('No data items found in analytical object')
            return
        }

        if (allDataDimensions.length === 1) {
            addLayersToMap()
        }
        // The deps matter: the early returns above leave hasAddedRef unset, so
        // the effect has to run again if the analytical object resolves late
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, layerId, allDataDimensions.length])

    // The analytical object may resolve after mount, leaving nothing preselected
    useEffect(() => {
        if (firstDimensionId) {
            setSelectedDataDims((dims) =>
                dims.length ? dims : [firstDimensionId]
            )
        }
    }, [firstDimensionId])

    if (type === EARTH_ENGINE_LAYER || allDataDimensions.length <= 1) {
        return null
    }

    return (
        <Modal small position="middle">
            <ModalTitle>{i18n.t('Open as map')}</ModalTitle>
            <ModalContent>
                <div className={styles.content}>
                    <div className={styles.description}>
                        {i18n.t(
                            'This chart/table contains {{numItems}} data items. Choose which items you want to import from the list below. Each data item will be created as a map layer.',
                            {
                                numItems: allDataDimensions.length,
                            }
                        )}
                    </div>
                    <SelectField
                        label={i18n.t('Data items')}
                        items={allDataDimensions}
                        value={selectedDataDims}
                        multiple={true}
                        onChange={setSelectedDataDims}
                    />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button
                        secondary
                        onClick={() => dispatch(clearAnalyticalObject())}
                    >
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        disabled={!selectedDataDims.length || isAdding}
                        primary
                        onClick={addLayersToMap}
                    >
                        {i18n.t('Proceed')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export default OpenAsMapDialog
