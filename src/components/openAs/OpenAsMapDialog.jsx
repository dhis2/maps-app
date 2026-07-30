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

    const [selectedDataDims, setSelectedDataDims] = useState([firstDimensionId])
    const hasAutoAdded = useRef(false)

    const addLayersToMap = async () => {
        const selectedDimensions = [...selectedDataDims].reverse()
        const lastDataId = allDataDimensions[selectedDimensions.length - 1]

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

        dispatch(clearAnalyticalObject())
    }

    const addEarthEngineLayersToMap = () => {
        const layerSource = getEarthEngineLayers().find(
            ({ layerId: id }) => layerId === id
        )
        const layer = getEarthEngineLayerFromAnalyticalObject({
            ao: currentAO,
        })
        const consolidatedLayer = {
            ...layerSource,
            aggregationType: layerSource.defaultAggregations,
            ...layer,
        }
        if (layerSource && layer) {
            dispatch(addLayer(consolidatedLayer))
        }

        dispatch(clearAnalyticalObject())
    }

    // Auto-add layers for the cases that need no user input. This must run in
    // an effect, not the render body -- dispatching here directly re-added
    // layers on every re-render (e.g. while useSetting/legend fetches resolve),
    // producing duplicate layers.
    useEffect(() => {
        if (hasAutoAdded.current) {
            return
        }

        if (type === EARTH_ENGINE_LAYER) {
            if (!layerId) {
                log.info('No earth engine layer id found in analytical object')
                return
            }
            hasAutoAdded.current = true
            addEarthEngineLayersToMap()
            return
        }

        if (!allDataDimensions.length) {
            log.info('No data items found in analytical object')
            return
        }

        if (allDataDimensions.length === 1) {
            hasAutoAdded.current = true
            addLayersToMap()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, layerId, allDataDimensions.length])

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
                    <Button secondary onClick={clearAnalyticalObject}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        disabled={!selectedDataDims.length}
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
