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
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearAnalyticalObject } from '../../actions/analyticalObject.js'
import { addLayer } from '../../actions/layers.js'
import {
    CURRENT_AO_KEY,
    getDataDimensionsFromAnalyticalObject,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject.js'
import { SelectField } from '../core/index.js'
import styles from './styles/OpenAsMapDialog.module.css'

const OpenAsMapDialog = () => {
    const dispatch = useDispatch()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const allDataDimensions = getDataDimensionsFromAnalyticalObject(currentAO)
    const firstDimensionId = allDataDimensions[0]?.id

    const [selectedDataDims, setSelectedDataDims] = useState([firstDimensionId])

    const addLayersToMap = async () => {
        const selectedDimensions = [...selectedDataDims].reverse()
        const lastDataId = allDataDimensions[selectedDimensions.length - 1]

        // Call in sequence
        for (const dataId of selectedDimensions) {
            const layer = await getThematicLayerFromAnalyticalObject(
                currentAO,
                dataId,
                dataId === lastDataId
            )

            if (layer) {
                dispatch(addLayer(layer))
            }
        }

        dispatch(clearAnalyticalObject())
    }

    if (!allDataDimensions.length) {
        log.info('No data items found in analytical object')
        return null // TODO show error
    }

    if (allDataDimensions.length === 1) {
        addLayersToMap()
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
