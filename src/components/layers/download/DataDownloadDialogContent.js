import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import i18n from '@dhis2/d2-i18n';
import EventDownloadInputs from './EventDownloadInputs';

const styles = theme => ({
    contentDiv: {
        marginBottom: theme.spacing.unit * 1.5,
    },
    inputContainer: {
        marginTop: theme.spacing.unit * 4,
    },
    infoDiv: {
        height: theme.spacing.unit * 2.5, // Ensure that we have enough buffer around the svg icon to prevent unnecessary scrollbars
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.85em',
        color: theme.palette.text.secondary,
    },
    icon: {
        fontSize: '1.125em',
        marginRight: theme.spacing.unit,
    },
    error: {
        marginTop: theme.spacing.unit * 1.5,
        color: theme.palette.error.main,
    },
});

export const DataDownloadDialogContent = ({
    classes,

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
        <div className={classes.contentDiv}>
            {i18n.t('Downloading GeoJSON data for "{{layerName}}"', {
                layerName: layerName,
            })}
        </div>
        <div className={classes.infoDiv}>
            <InfoIcon className={classes.icon} />
            {i18n.t(
                'GeoJSON is supported by most GIS software, including QGIS and ArcGIS Desktop.'
            )}
        </div>
        {isEventLayer && (
            <div className={classes.inputContainer}>
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
            <div className={classes.error}>
                <ErrorIcon className={classes.icon} />
                {i18n.t('Data download failed.')}
            </div>
        )}
    </Fragment>
);

DataDownloadDialogContent.propTypes = {
    classes: PropTypes.object.isRequired,

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

export default withStyles(styles)(DataDownloadDialogContent);
