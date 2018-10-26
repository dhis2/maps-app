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
import Checkbox from '../core/Checkbox';
import LegendPosition from './LegendPosition';
import {
    setDownloadState,
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
        padding: '0 24px',
        minHeight: 150,
        lineHeight: '24px',
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
        showLegend: PropTypes.bool.isRequired,
        legendPosition: PropTypes.string.isRequired,
        setDownloadState: PropTypes.func.isRequired,
        setDownloadLegendState: PropTypes.func.isRequired,
        setDownloadLegendPosition: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    render() {
        const {
            isActive,
            showLegend,
            legendPosition,
            setDownloadLegendState,
            setDownloadLegendPosition,
            classes,
        } = this.props;
        const isSupported = downloadSupport();

        console.log(showLegend, legendPosition);

        return (
            <Dialog open={isActive} onClose={this.onClose}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {i18n.t('Download map')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {isSupported ? (
                        <React.Fragment>
                            <Checkbox
                                label={i18n.t('Include legend')}
                                checked={showLegend}
                                onCheck={setDownloadLegendState}
                            />
                            {showLegend && (
                                <LegendPosition
                                    position={legendPosition}
                                    onChange={setDownloadLegendPosition}
                                />
                            )}
                        </React.Fragment>
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
        const mapEl = document.getElementsByClassName('leaflet-container')[0];
        const options = {
            width: mapEl.offsetWidth,
            height: mapEl.offsetHeight,
        };

        convertToPng(mapEl, options).then(dataUri =>
            downloadFile(
                dataURItoBlob(dataUri),
                `map-${Math.random()
                    .toString(36)
                    .substring(7)}.png`
            )
        );
    };
}

export default connect(
    state => ({
        ...state.download,
    }),
    { setDownloadState, setDownloadLegendState, setDownloadLegendPosition }
)(withStyles(styles)(DownloadDialog));
