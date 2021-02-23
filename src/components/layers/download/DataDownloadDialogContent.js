import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { NoticeBox } from '@dhis2/ui';
import { Help } from '../../core';
import EventDownloadInputs from './EventDownloadInputs';
import styles from './styles/DataDownloadDialogContent.module.css';

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
);

DataDownloadDialogContent.propTypes = {
    isEventLayer: PropTypes.bool.isRequired,
    error: PropTypes.string,
    layerName: PropTypes.string.isRequired,
    formatOptions: PropTypes.array.isRequired,
    selectedFormatOption: PropTypes.number,
    humanReadableChecked: PropTypes.bool.isRequired,
    onChangeFormatOption: PropTypes.func.isRequired,
    onCheckHumanReadable: PropTypes.func.isRequired,
};

export default DataDownloadDialogContent;
