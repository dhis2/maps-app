import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Help } from '../../core/index.js'
import EventDownloadInputs from './EventDownloadInputs.js'
import styles from './styles/DataDownloadDialogContent.module.css'

export const DataDownloadDialogContent = ({
    isEventLayer,
    error,
    layerName,
    formatOptions,
    selectedFormatOption,
    humanReadableChecked,
    onChangeFormatOption,
    onCheckHumanReadable,
}) => (
    <Fragment>
        <div className={styles.contentDiv}>
            {i18n.t('Downloading GeoJSON data for "{{layerName}}"', {
                layerName: layerName,
            })}
        </div>
        <Help>
            {i18n.t(
                'GeoJSON is supported by most GIS software, including QGIS and ArcGIS Desktop.'
            )}
        </Help>
        {isEventLayer && (
            <div className={styles.inputContainer}>
                <EventDownloadInputs
                    selectedFormatOption={selectedFormatOption}
                    humanReadableChecked={humanReadableChecked}
                    formatOptions={formatOptions}
                    onChangeFormatOption={onChangeFormatOption}
                    onCheckHumanReadable={onCheckHumanReadable}
                />
            </div>
        )}
        {error && (
            <NoticeBox error>{i18n.t('Data download failed.')}</NoticeBox>
        )}
    </Fragment>
)

DataDownloadDialogContent.propTypes = {
    formatOptions: PropTypes.array.isRequired,
    humanReadableChecked: PropTypes.bool.isRequired,
    isEventLayer: PropTypes.bool.isRequired,
    layerName: PropTypes.string.isRequired,
    onChangeFormatOption: PropTypes.func.isRequired,
    onCheckHumanReadable: PropTypes.func.isRequired,
    error: PropTypes.string,
    selectedFormatOption: PropTypes.number,
}

export default DataDownloadDialogContent
