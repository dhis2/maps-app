import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { setDownloadState } from '../../actions/download';
import {
    convertToPng,
    dataURItoBlob,
    downloadFile,
    calculateExportImageSize,
} from '../../util/export-image-utils';

const styles = {
    title: {
        padding: '20px 24px 4px 24px',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: '0 24px',
        minHeight: 150,
    },
};

// https://github.com/uber/kepler.gl/blob/master/src/constants/default-settings.js
// https://github.com/uber/kepler.gl/blob/master/src/utils/export-image-utils.js
// https://github.com/uber/kepler.gl/blob/master/src/components/modal-container.js
// https://github.com/uber/kepler.gl/blob/master/src/components/modals/export-image-modal.js
// https://github.com/uber/kepler.gl/blob/master/src/components/plot-container.js
class DownloadDialog extends Component {
    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        setDownloadState: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        mapEl: null,
        width: null,
        height: null,
        ratio: 'screen',
        resolution: '1x',
    };

    // TODO: Best place to update state?
    componentDidUpdate(prevProps) {
        /*
        const mapEl = document.getElementsByClassName('leaflet-container')[0];
        const { offsetWidth, offsetHeight } = mapEl;
        const { width, height } = this.state;
        const { open } = this.props;

        if (open !== prevProps.open && mapEl) {
            open
                ? this.setDownloadStyle(mapEl)
                : this.clearDownloadStyle(mapEl);
        }

        if (width !== offsetWidth || height !== offsetHeight) {
            this.setState({
                mapEl,
                width: mapEl.offsetWidth,
                height: mapEl.offsetHeight,
            });
        }
        */
    }

    render() {
        const { isActive, classes } = this.props;
        /*
        const { width, height, ratio, resolution } = this.state;

        const exportImageSize = calculateExportImageSize({
            width,
            height,
            ratio,
            resolution,
        });
        */

        // console.log(width, height, ratio, resolution, exportImageSize);

        return (
            <Dialog open={isActive} onClose={this.onClose}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {i18n.t('Download map')}
                </DialogTitle>
                <DialogContent className={classes.content}>#</DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button color="primary" onClick={this.onDownload}>
                        {i18n.t('Download')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    onClose = () => this.props.setDownloadState(false);

    onDownload = () => {
        // const exportImageSize = calculateExportImageSize(this.state);
        const { mapEl, width, height } = this.state;
        // const { mapEl } = this.state;

        // this.setDownloadStyle();

        convertToPng(mapEl, { width, height }).then(dataUri => {
            // convertToPng(mapEl).then(dataUri => {
            downloadFile(
                dataURItoBlob(dataUri),
                `map-${Math.random()
                    .toString(36)
                    .substring(7)}.png`
            );

            // this.clearDownloadStyle();
        });
    };

    setDownloadStyle = () => {
        const el = document.getElementById('dhis-gis-container');

        // const exportImageSize = calculateExportImageSize(this.state);
        // const { width, height } = exportImageSize;

        el.classList.add('dhis2-download');

        // mapEl.style.width = width + 'px';
        // mapEl.style.height = height + 'px';
        // mapEl.style.position = 'absolute';

        console.log('setDownloadStyle', el);
    };

    clearDownloadStyle = () => {
        const el = document.getElementById('dhis-gis-container');
        el.classList.remove('dhis2-download');

        console.log('clearDownloadStyle');

        // mapEl.style.width = '100%';
        // mapEl.style.height = '100%';
    };
}

export default connect(
    state => ({
        ...state.download,
    }),
    { setDownloadState }
)(withStyles(styles)(DownloadDialog));
