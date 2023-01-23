import i18n from '@dhis2/d2-i18n'
import { Modal, ModalTitle, ModalContent, ModalActions } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { EVENT_LAYER } from '../../../constants/layers.js'
import useEventLayerColumns from '../../../hooks/useEventLayerColumns.js'
import {
    getFormatOptions,
    addAggregatedValues,
    downloadGeoJson,
} from '../../../util/dataDownload.js'
import { SelectField, Checkbox, Help } from '../../core/index.js'
import DataDownloadDialogActions from './DataDownloadDialogActions.js'
import styles from './styles/DataDownloadDialog.module.css'

const DataDownloadDialog = ({ layer, onCloseDialog }) => {
    const formatOptions = getFormatOptions()
    const { eventColumns, fetchEventColumns } = useEventLayerColumns()
    const [formatOption, setFormatOption] = useState(formatOptions[2])
    const [humanReadable, setHumanReadable] = useState(true)
    const aggregations = useSelector((state) => state.aggregations[layer.id])
    const { layer: layerType } = layer
    const isEventLayer = layerType === EVENT_LAYER

    const downloading = false

    const downloadData = useCallback(() => {
        const { name } = layer

        console.log('downloadData', layer, aggregations)

        const data = aggregations
            ? addAggregatedValues(layer, layer.data, aggregations)
            : layer.data

        downloadGeoJson({ name, data })

        onCloseDialog()
    }, [layer, aggregations, onCloseDialog])

    useEffect(() => {
        if (isEventLayer) {
            fetchEventColumns(layer, formatOption.id)
            // console.log('###', layer, formatOption)
        }
    }, [isEventLayer, layer, formatOption, fetchEventColumns])

    console.log('DataDownloadDialog', aggregations)

    return (
        <Modal position="middle" onClose={onCloseDialog}>
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
                {isEventLayer && (
                    <div className={styles.inputContainer}>
                        <div className={styles.headingDiv}>
                            {i18n.t('GeoJSON Properties:')}
                        </div>
                        <div className={styles.selectField}>
                            <SelectField
                                label={i18n.t('ID Format')}
                                items={formatOptions}
                                value={formatOption?.id}
                                onChange={setFormatOption}
                            />
                        </div>
                        <Checkbox
                            className={styles.checkboxRoot}
                            label={i18n.t('Use human-readable keys')}
                            checked={humanReadable}
                            onChange={setHumanReadable}
                        />
                    </div>
                )}
            </ModalContent>
            <ModalActions>
                <DataDownloadDialogActions
                    downloading={downloading}
                    onStartClick={downloadData}
                    onCancelClick={onCloseDialog}
                />
            </ModalActions>
        </Modal>
    )
}

DataDownloadDialog.propTypes = {
    onCloseDialog: PropTypes.func.isRequired,
    layer: PropTypes.object,
}

export default DataDownloadDialog

/*
class DataDownloadDialog extends Component {
    static propTypes = {
        closeDialog: PropTypes.func.isRequired,
        downloading: PropTypes.bool.isRequired,
        open: PropTypes.bool.isRequired,
        startDownload: PropTypes.func.isRequired,
        aggregations: PropTypes.object,
        error: PropTypes.string,
        layer: PropTypes.object,
    }

    state = {
        selectedFormatOption: 2,
        humanReadableChecked: true,
    }

    onChangeFormatOption = (newValue) => {
        this.setState({ selectedFormatOption: newValue.id - 1 })
    }
    onCheckHumanReadable = (isChecked) => {
        this.setState({ humanReadableChecked: isChecked })
    }

    onStartDownload = () => {
        const { layer, aggregations } = this.props
        const {
            selectedFormatOption,
            humanReadableChecked: humanReadableKeys,
        } = this.state
        const format = formatOptionsFlat[selectedFormatOption]

        this.props.startDownload({
            layer,
            aggregations,
            format,
            humanReadableKeys,
        })
    }

    render() {
        const { open, layer, downloading, error, closeDialog } = this.props

        if (!open || !layer) {
            return null
        }

        const layerType = layer.layer,
            isEventLayer = layerType === EVENT_LAYER

        return (
            <Modal position="middle" onClose={closeDialog}>
                <ModalTitle>{i18n.t('Download Layer Data')}</ModalTitle>
                <ModalContent>
                    <DataDownloadDialogContent
                        isEventLayer={isEventLayer}
                        error={error}
                        layerName={layer.name}
                        formatOptions={formatOptions}
                        selectedFormatOption={
                            this.state.selectedFormatOption + 1
                        }
                        humanReadableChecked={this.state.humanReadableChecked}
                        onChangeFormatOption={this.onChangeFormatOption}
                        onCheckHumanReadable={this.onCheckHumanReadable}
                    />
                </ModalContent>
                <ModalActions>
                    <DataDownloadDialogActions
                        downloading={downloading}
                        onStartClick={this.onStartDownload}
                        onCancelClick={closeDialog}
                    />
                </ModalActions>
            </Modal>
        )
    }
}

const mapStateToProps = ({ dataDownload, map, aggregations = {} }) => {
    const { layerid, dialogOpen: open, downloading, error } = dataDownload
    const layer = map.mapViews.find((l) => l.id === layerid)

    if (open && !layer) {
        console.error(
            'Tried to open data download dialog without specifying a source layer!'
        )
    }

    return {
        open,
        layer,
        downloading,
        error,
        aggregations: aggregations[layerid],
    }
}

export default connect(mapStateToProps, {
    closeDialog: closeDataDownloadDialog,
    startDownload: startDataDownload,
})(DataDownloadDialog)
*/
