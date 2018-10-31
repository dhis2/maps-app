import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { SelectField } from '../../core/SelectField';
import Checkbox from '../../core/Checkbox';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import i18n from '@dhis2/d2-i18n';

const styles = theme => ({
    contentDiv: {
        marginBottom: theme.spacing.unit * 1.5,
    },
    selectField: {
        width: '50%',
        marginLeft: theme.spacing.unit * 1.5,
    },
    error: {
        marginTop: theme.spacing.unit * 1.5,
        color: theme.palette.error.main,
    },
    errorIcon: {
        marginBottom: -6,
        marginRight: theme.spacing.unit * 1.5,
    },
});

const EventDownloadInputs = ({
    classes,

    formatOptions,
    selectedFormatOption,
    humanReadableChecked,
    onChangeFormatOption,
    onCheckHumanReadable,
}) => (
    <Fragment>
        <div key="description" className={classes.contentDiv}>
            {i18n.t('Please select the format for GeoJSON Feature keys')}
        </div>
        <div key="form" className={classes.contentDiv}>
            <SelectField
                classes={{
                    textField: classes.selectField,
                }}
                label={i18n.t('Meta-data ID Format')}
                items={formatOptions}
                value={selectedFormatOption}
                onChange={onChangeFormatOption}
            />
            <Checkbox
                label={i18n.t(
                    'Output human-readable keys for non-dimension attributes'
                )}
                checked={humanReadableChecked}
                onCheck={onCheckHumanReadable}
            />
        </div>
    </Fragment>
);
EventDownloadInputs.propTypes = {
    classes: PropTypes.object.isRequired,

    formatOptions: PropTypes.array.isRequired,
    selectedFormatOption: PropTypes.number.isRequired,
    humanReadableChecked: PropTypes.bool.isRequired,

    onChangeFormatOption: PropTypes.func.isRequired,
    onCheckHumanReadable: PropTypes.func.isRequired,
};

export const DataDownloadDialogContent = ({
    classes,

    isEventLayer,
    error,

    formatOptions,
    selectedFormatOption,
    humanReadableChecked,
    onChangeFormatOption,
    onCheckHumanReadable,
}) => (
    <Fragment>
        <div className={classes.contentDiv}>
            {i18n.t(
                'The data for this layer will be downloaded in GeoJSON format.'
            )}
        </div>
        <div className={classes.contentDiv}>
            {i18n.t(
                'This format is supported by most GIS software, including QGIS and ArcGIS Desktop.'
            )}
        </div>
        {isEventLayer && (
            <EventDownloadInputs
                classes={classes}
                selectedFormatOption={selectedFormatOption}
                humanReadableChecked={humanReadableChecked}
                formatOptions={formatOptions}
                onChangeFormatOption={onChangeFormatOption}
                onCheckHumanReadable={onCheckHumanReadable}
            />
        )}
        {error && (
            <div className={classes.error}>
                <ErrorIcon className={classes.errorIcon} />
                {i18n.t('Data download failed.')}
            </div>
        )}
    </Fragment>
);

DataDownloadDialogContent.propTypes = {
    classes: PropTypes.object.isRequired,

    isEventLayer: PropTypes.bool.isRequired,
    error: PropTypes.string,

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
