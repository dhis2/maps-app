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
    setDownloadState,
    setDownloadNameState,
    setDownloadLegendState,
    setDownloadLegendPosition,
} from '../../actions/download';
import {
    convertToPng,
    dataURItoBlob,
    downloadFile,
    downloadSupport,
} from '../../util/export-image-utils';

const styles = {
    title: {
        padding: '20px 24px 4px 24px',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: '12px 24px 0',
        lineHeight: '24px',
        minHeight: 250,
        width: 250,
    },
    checkbox: {
        display: 'block',
        marginLeft: -14,
        marginTop: -16,
        marginBottom: -16,
    },
};

class DownloadDialog extends Component {
    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        showName: PropTypes.bool.isRequired,
        showLegend: PropTypes.bool.isRequired,
        legendPosition: PropTypes.string.isRequired,
        setDownloadState: PropTypes.func.isRequired,
        setDownloadNameState: PropTypes.func.isRequired,
        setDownloadLegendState: PropTypes.func.isRequired,
        setDownloadLegendPosition: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        error: null,
    };

    render() {
        const {
            isActive,
            showName,
            showLegend,
            legendPosition,
            setDownloadNameState,
            setDownloadLegendState,
            setDownloadLegendPosition,
            classes,
        } = this.props;

        const isSupported = downloadSupport();

        return (
            <Dialog open={isActive} onClose={this.onClose}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {i18n.t('Download map')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {isSupported && !this.state.error ? (
                        <Fragment>
                            <div className={classes.checkbox}>
                                <Checkbox
                                    label={i18n.t('Show title')}
                                    checked={showName}
                                    onCheck={setDownloadNameState}
                                />
                            </div>
                            <div className={classes.checkbox}>
                                <Checkbox
                                    label={i18n.t('Show legend')}
                                    checked={showLegend}
                                    onCheck={setDownloadLegendState}
                                />
                            </div>
                            {showLegend && (
                                <LegendPosition
                                    position={legendPosition}
                                    onChange={setDownloadLegendPosition}
                                />
                            )}
                        </Fragment>
                    ) : (
                        <p>
                            {i18n.t(
                                'Map download is not supported by your browser. Try Google Chrome or Firefox.'
                            )}
                        </p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        color="primary"
                        disabled={!isSupported}
                        onClick={this.onDownload}
                    >
                        {i18n.t('Download')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    onClose = () => this.props.setDownloadState(false);

    onDownload = () => {
        const mapEl = document.getElementById('dhis2-maps-container');
        const filename = `map-${Math.random()
            .toString(36)
            .substring(7)}.png`;

        const options = {
            width: mapEl.offsetWidth,
            height: mapEl.offsetHeight,
        };

        convertToPng(mapEl, options)
            .then(dataUri => downloadFile(dataURItoBlob(dataUri), filename))
            .catch(this.onError);
    };

    // Not working in Safari: https://github.com/tsayen/dom-to-image/issues/27
    onError = error => {
        this.setState({ error });
    };
}

export default connect(
    state => ({
        ...state.download,
    }),
    {
        setDownloadState,
        setDownloadNameState,
        setDownloadLegendState,
        setDownloadLegendPosition,
    }
)(withStyles(styles)(DownloadDialog));
