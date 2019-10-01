import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Checkbox from '../core/Checkbox';
import LegendPosition from './LegendPosition';
import {
    toggleDownloadDialog,
    toggleDownloadShowName,
    toggleDownloadShowLegend,
    setDownloadLegendPosition,
} from '../../actions/download';
import {
    convertToPng,
    dataURItoBlob,
    downloadFile,
    downloadSupport,
} from '../../util/export-image';

const styles = {
    content: {
        minHeight: 250,
        width: 250,
    },
    checkbox: {
        display: 'block',
        marginLeft: -14,
        marginTop: -16,
        marginBottom: -8,
    },
};

export class DownloadDialog extends Component {
    static propTypes = {
        showDialog: PropTypes.bool.isRequired,
        showName: PropTypes.bool.isRequired,
        showLegend: PropTypes.bool.isRequired,
        legendPosition: PropTypes.string.isRequired,
        hasName: PropTypes.bool.isRequired,
        hasLegend: PropTypes.bool.isRequired,
        toggleDownloadDialog: PropTypes.func.isRequired,
        toggleDownloadShowName: PropTypes.func.isRequired,
        toggleDownloadShowLegend: PropTypes.func.isRequired,
        setDownloadLegendPosition: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        error: null,
    };

    render() {
        const {
            showDialog,
            hasName,
            showName,
            hasLegend,
            showLegend,
            legendPosition,
            toggleDownloadShowName,
            toggleDownloadShowLegend,
            setDownloadLegendPosition,
            classes,
        } = this.props;

        if (!showDialog) {
            return null;
        }

        const isSupported = downloadSupport() && !this.state.error;

        return (
            <Dialog open={showDialog} onClose={this.onClose}>
                <DialogTitle disableTypography={true}>
                    {i18n.t('Download map')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {isSupported ? (
                        <Fragment>
                            <div className={classes.checkbox}>
                                <Checkbox
                                    label={i18n.t('Show name')}
                                    checked={showName}
                                    disabled={!hasName}
                                    onCheck={toggleDownloadShowName}
                                />
                            </div>
                            <div className={classes.checkbox}>
                                <Checkbox
                                    label={i18n.t('Show legend')}
                                    checked={showLegend}
                                    disabled={!hasLegend}
                                    onCheck={toggleDownloadShowLegend}
                                />
                            </div>
                            {hasLegend && showLegend && (
                                <LegendPosition
                                    position={legendPosition}
                                    onChange={setDownloadLegendPosition}
                                />
                            )}
                        </Fragment>
                    ) : (
                        i18n.t(
                            'Map download is not supported by your browser. Try Google Chrome or Firefox.'
                        )
                    )}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onClose}>
                        {isSupported ? i18n.t('Cancel') : i18n.t('Close')}
                    </Button>
                    {isSupported && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.onDownload}
                        >
                            {i18n.t('Download')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        );
    }

    onClose = () => this.props.toggleDownloadDialog(false);

    onDownload = () => {
        const mapEl = document.getElementById('dhis2-map-container');

        const filename = `map-${Math.random()
            .toString(36)
            .substring(7)}.png`;

        const options = {
            width: mapEl.offsetWidth,
            height: mapEl.offsetHeight,
        };

        convertToPng(mapEl, options)
            .then(dataUri => {
                downloadFile(dataURItoBlob(dataUri), filename);
                this.onClose();
            })
            .catch(this.onError);
    };

    // Not working in Safari: https://github.com/tsayen/dom-to-image/issues/27
    onError = error => {
        this.setState({ error });
    };
}

export default connect(
    state => ({
        hasName: state.map.name !== undefined,
        hasLegend: state.map.mapViews.filter(layer => layer.legend).length > 0,
        ...state.download,
    }),
    {
        toggleDownloadDialog,
        toggleDownloadShowName,
        toggleDownloadShowLegend,
        setDownloadLegendPosition,
    }
)(withStyles(styles)(DownloadDialog));
