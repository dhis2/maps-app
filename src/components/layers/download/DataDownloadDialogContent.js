import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import i18n from '@dhis2/d2-i18n';
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
        <div className={styles.infoDiv}>
            <InfoIcon className={styles.icon} />
            {i18n.t(
                'GeoJSON is supported by most GIS software, including QGIS and ArcGIS Desktop.'
            )}
        </div>
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
            <div className={styles.error}>
                <ErrorIcon className={styles.icon} />
                {i18n.t('Data download failed.')}
            </div>
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
DataDownloadDialogContent.defaultProps = {
    selectedFormatOption: 0,
};

export default DataDownloadDialogContent;
