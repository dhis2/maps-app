import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Checkbox from '../../core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import ErrorIcon from '@material-ui/icons/ErrorOutline';

import SelectField from '../../core/SelectField';
import {
    META_DATA_FORMAT_ID,
    META_DATA_FORMAT_NAME,
    META_DATA_FORMAT_CODE,
} from '../../../util/geojson';

import {
    closeDataDownloadDialog,
    startDataDownload,
} from '../../../actions/dataDownload';

const styles = theme => ({
    paper: {
        width: 480,
    },
    content: {
        minHeight: 320,
    },
    wrapper: {
        position: 'relative',
    },
    btnProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
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

const formatOptionsFlat = [
    META_DATA_FORMAT_ID,
    META_DATA_FORMAT_CODE,
    META_DATA_FORMAT_NAME,
];
const formatOptions = formatOptionsFlat.map((name, i) => ({
    id: i + 1,
    name,
}));

class DataDownloadDialog extends Component {
    static propTypes = {
        open: PropTypes.bool.isRequired,
        downloading: PropTypes.bool.isRequired,
        error: PropTypes.string,
        layer: PropTypes.object,
        startDownload: PropTypes.func.isRequired,
        closeDialog: PropTypes.func.isRequired,

        classes: PropTypes.object.isRequired,
    };

    state = {
        selectedFormatOption: 2,
        humanReadableChecked: true,
    };

    onChangeFormatOption = newValue => {
        this.setState({ selectedFormatOption: newValue.id - 1 });
    };
    onCheckHumanReadable = isChecked => {
        this.setState({ humanReadableChecked: isChecked });
    };

    renderEventDownloadInputs = ({ classes }) => [
        <div key="description" className={classes.contentDiv}>
            {i18n.t('Please select the format for GeoJSON Feature keys')}
        </div>,
        <div key="form" className={classes.contentDiv}>
            <SelectField
                classes={{
                    textField: classes.selectField,
                }}
                label={i18n.t('Meta-data ID Format')}
                items={formatOptions}
                value={this.state.selectedFormatOption + 1}
                onChange={this.onChangeFormatOption}
            />
            <Checkbox
                label={i18n.t(
                    'Output human-readable keys for non-dimension attributes'
                )}
                checked={this.state.humanReadableChecked}
                onCheck={this.onCheckHumanReadable}
            />
        </div>,
    ];

    render() {
        const {
            open,
            layer,
            downloading,
            error,

            startDownload,
            closeDialog,

            classes,
        } = this.props;

        if (!open || !layer) {
            return null;
        }

        const layerType = layer.layer,
            isEventLayer = layerType === 'event';

        return (
            <Dialog open={open} classes={{ paper: classes.paper }}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {i18n.t('Download Layer Data')}
                </DialogTitle>
                <DialogContent className={classes.content}>
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
                    {isEventLayer &&
                        this.renderEventDownloadInputs({ classes })}
                    {error && (
                        <div className={classes.error}>
                            <ErrorIcon className={classes.errorIcon} />
                            {i18n.t('Data download failed.')}
                        </div>
                    )}
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <Button
                        color="primary"
                        onClick={() => closeDialog()}
                        disabled={downloading}
                    >
                        {i18n.t('Cancel')}
                    </Button>
                    <div className={classes.wrapper}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                                startDownload(
                                    layer,
                                    formatOptionsFlat[
                                        this.state.selectedFormatOption
                                    ],
                                    this.state.humanReadableChecked
                                )
                            }
                            disabled={downloading}
                        >
                            {i18n.t('Download')}
                        </Button>
                        {downloading && (
                            <CircularProgress
                                size={24}
                                className={classes.btnProgress}
                            />
                        )}
                    </div>
                </DialogActions>
            </Dialog>
        );
    }
}

const mapStateToProps = state => {
    const id = state.dataDownload.layerid;
    const layer =
        id !== null ? state.map.mapViews.filter(l => l.id === id)[0] : null;

    if (state.dataDownload.dialogOpen && !layer) {
        console.error(
            'Tried to open data download dialog without specifying a source layer!'
        );
    }
    return {
        open: state.dataDownload.dialogOpen,
        layer: layer,
        downloading: state.dataDownload.downloading,
        error: state.dataDownload.error,
    };
};

export default connect(
    mapStateToProps,
    {
        closeDialog: closeDataDownloadDialog,
        startDownload: startDataDownload,
    }
)(withStyles(styles)(DataDownloadDialog));
