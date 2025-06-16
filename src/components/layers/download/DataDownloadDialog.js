import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    NoticeBox,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { EVENT_LAYER } from '../../../constants/layers.js'
import { getFormatOptions, downloadData } from '../../../util/dataDownload.js'
import { useAppData } from '../../app/AppDataProvider.js'
import { SelectField, Checkbox, Help } from '../../core/index.js'
import DataDownloadDialogActions from './DataDownloadDialogActions.js'
import styles from './styles/DataDownloadDialog.module.css'

const DataDownloadDialog = ({ layer, onCloseDialog }) => {
    const engine = useDataEngine()
    const { nameProperty } = useAppData()
    const formatOptions = getFormatOptions()
    const [selectedFormat, setSelectedFormat] = useState(formatOptions[2])
    const [humanReadable, setHumanReadable] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const [error, setError] = useState(null)

    const aggregations = useSelector((state) => state.aggregations)

    const onChangeFormat = (format) => {
        setError(null)
        setSelectedFormat(format)
    }

    const onChangeHumanReadable = (isChecked) => {
        setError(null)
        setHumanReadable(isChecked)
    }

    const onClose = () => {
        setError(null)
        onCloseDialog()
    }

    const onStartDownload = async () => {
        setIsDownloading(true)
        setError(null)
        console.log('onStartDownload', { nameProperty, layer })
        try {
            await downloadData({
                layer,
                aggregations: aggregations[layer.id],
                format: selectedFormat.id,
                humanReadableKeys: humanReadable,
                nameProperty,
                engine,
            })
            setIsDownloading(false)
            onClose()
        } catch (e) {
            console.log('download failed', e)
            setIsDownloading(false)
            setError(`download failed ${e}`)
        }
    }

    if (!layer) {
        console.error(
            'Tried to open data download dialog without specifying a source layer!'
        )
    }

    return (
        <Modal
            position="middle"
            onClose={onClose}
            dataTest="data-download-modal"
        >
            <ModalTitle>{i18n.t('Download Layer Data')}</ModalTitle>
            <ModalContent>
                <div className={styles.contentDiv}>
                    {i18n.t('Downloading GeoJSON data for "{{layerName}}"', {
                        layerName: layer.name,
                    })}
                </div>
                <Help>
                    {i18n.t(
                        'GeoJSON is supported by most GIS software, including QGIS and ArcGIS Desktop.'
                    )}
                </Help>
                {layer.layer === EVENT_LAYER && (
                    <div className={styles.inputContainer}>
                        <>
                            <div className={styles.headingDiv}>
                                {i18n.t('GeoJSON Properties:')}
                            </div>
                            <div className={styles.selectField}>
                                <SelectField
                                    label={i18n.t('ID Format')}
                                    items={formatOptions}
                                    value={selectedFormat?.id}
                                    onChange={onChangeFormat}
                                />
                            </div>
                            <Checkbox
                                className={styles.checkboxRoot}
                                label={i18n.t('Use human-readable keys')}
                                checked={humanReadable}
                                onChange={onChangeHumanReadable}
                            />
                        </>
                    </div>
                )}
                {error && (
                    <NoticeBox error>
                        {i18n.t('Data download failed.')}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <DataDownloadDialogActions
                    downloading={isDownloading}
                    onStartClick={onStartDownload}
                    onCancelClick={onClose}
                />
            </ModalActions>
        </Modal>
    )
}

DataDownloadDialog.propTypes = {
    onCloseDialog: PropTypes.func.isRequired,
    layer: PropTypes.shape({
        id: PropTypes.string,
        layer: PropTypes.string,
        name: PropTypes.string,
    }),
}

export default DataDownloadDialog
