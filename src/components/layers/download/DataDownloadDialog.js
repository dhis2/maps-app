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
import InfoIcon from '@material-ui/icons/HelpOutline';

import SelectField from '../../core/SelectField';
import {
    META_DATA_FORMAT_ID,
    META_DATA_FORMAT_NAME,
    META_DATA_FORMAT_CODE,
} from '../../../util/dataDownload';

import {
    closeDataDownloadDialog,
    startDataDownload,
} from '../../../actions/dataDownload';

const styles = theme => ({
    paper: {
        width: 600,
    },
    title: {
        padding: '20px 24px 4px 24px',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: '0 24px',
        minHeight: 300,
    },
    wrapper: {
        margin: theme.spacing.unit,
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
        margin: theme.spacing.unit * 4,
        '& a': {
            color: theme.palette.primary.main,
            marginLeft: theme.spacing.unit,
        },
    },
    infoIcon: {
        height: 16,
        marginBottom: -3,
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
        layer: PropTypes.object,
        startDownload: PropTypes.func.isRequired,
        closeDialog: PropTypes.func.isRequired,

        classes: PropTypes.object.isRequired,
    };

    state = {
        selectedFormatOption: 0,
        humanReadableChecked: false,
    };

    onChangeFormatOption = newValue => {
        this.setState({ selectedFormatOption: newValue.id - 1 });
    };
    onCheckHumanReadable = isChecked => {
        this.setState({ humanReadableChecked: isChecked });
    };

    render() {
        const {
            open,
            layer,

            downloading,
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
                        <br />
                        <small>
                            <a target="_new" href="http://geojson.org">
                                <InfoIcon className={classes.infoIcon} />
                                {i18n.t('What is GeoJSON?')}
                            </a>
                        </small>
                    </div>
                    {isEventLayer ? (
                        <div className={classes.contentDiv}>
                            {i18n.t(
                                'Please select the format for GeoJSON Feature keys'
                            )}
                            <SelectField
                                label={i18n.t('Meta-data ID Format')}
                                items={formatOptions}
                                value={this.state.selectedFormatOption + 1}
                                onChange={this.onChangeFormatOption}
                            />
                            <Checkbox
                                label={i18n.t(
                                    'Output human-readable keys for non-dimension data attributes'
                                )}
                                checked={this.state.humanReadableChecked}
                                onCheck={this.onCheckHumanReadable}
                            />
                        </div>
                    ) : null}
                </DialogContent>
                <DialogActions>
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
    };
};

export default connect(
    mapStateToProps,
    {
        closeDialog: closeDataDownloadDialog,
        startDownload: startDataDownload,
    }
)(withStyles(styles)(DataDownloadDialog));
