import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import i18n from '@dhis2/d2-i18n'
import { Modal, ModalTitle, ModalContent, ModalActions } from '@dhis2/ui'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeDataDownloadDialog } from '../../../actions/dataDownload.js'
import { EVENT_LAYER } from '../../../constants/layers.js'
import {
    METADATA_FORMAT_ID,
    METADATA_FORMAT_NAME,
    METADATA_FORMAT_CODE,
} from '../../../util/metadataFormats.js'
import DataDownloadDialogActions from './DataDownloadDialogActions.js'
import DataDownloadDialogContent from './DataDownloadDialogContent.js'
import { downloadData } from './downloadData.js'

const formatOptionsFlat = [
    METADATA_FORMAT_ID,
    METADATA_FORMAT_CODE,
    METADATA_FORMAT_NAME,
]
const formatOptions = formatOptionsFlat.map((name, i) => ({
    id: i + 1,
    name,
}))

const DataDownloadDialog = () => {
    const { d2 } = useD2()
    const [selectedFormat, setSelectedFormat] = useState(2)
    const [humanReadable, setHumanReadable] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const [error, setError] = useState(null)

    const dispatch = useDispatch()
    const { mapViews } = useSelector((state) => state.map)
    const aggregations = useSelector((state) => state.aggregations)
    const { layerid, dialogOpen } = useSelector((state) => state.dataDownload)

    const layer = mapViews.find((l) => l.id === layerid)

    const onChangeFormat = (format) => {
        setError(null)
        setSelectedFormat(format.id - 1)
    }

    const onChangeHumanReadable = (isChecked) => {
        setError(null)
        setHumanReadable(isChecked)
    }

    const onCloseDialog = () => {
        setError(null)
        dispatch(closeDataDownloadDialog())
    }

    const onStartDownload = async () => {
        setIsDownloading(true)
        setError(null)
        try {
            await downloadData({
                layer,
                aggregations: aggregations[layerid],
                format: formatOptionsFlat[selectedFormat],
                humanReadableKeys: humanReadable,
                d2,
            })
            setIsDownloading(false)
            onCloseDialog()
        } catch (e) {
            console.log('download failed', e)
            setIsDownloading(false)
            setError(`download failed ${e}`)
        }
    }

    if (!dialogOpen || !layer) {
        return null
    }

    if (dialogOpen && !layer) {
        console.error(
            'Tried to open data download dialog without specifying a source layer!'
        )
    }

    return (
        <Modal
            position="middle"
            onClose={onCloseDialog}
            dataTest="data-download-modal"
        >
            <ModalTitle>{i18n.t('Download Layer Data')}</ModalTitle>
            <ModalContent>
                <DataDownloadDialogContent
                    isEventLayer={layer.layer === EVENT_LAYER}
                    error={error}
                    layerName={layer.name}
                    formatOptions={formatOptions}
                    selectedFormatOption={selectedFormat + 1}
                    humanReadableChecked={humanReadable}
                    onChangeFormatOption={onChangeFormat}
                    onCheckHumanReadable={onChangeHumanReadable}
                />
            </ModalContent>
            <ModalActions>
                <DataDownloadDialogActions
                    downloading={isDownloading}
                    onStartClick={onStartDownload}
                    onCancelClick={onCloseDialog}
                />
            </ModalActions>
        </Modal>
    )
}

export default DataDownloadDialog
