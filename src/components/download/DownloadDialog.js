import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import {
    convertToPng,
    dataURItoBlob,
    downloadFile,
} from '../../util/export-image-utils';

const styles = {
    title: {
        padding: '20px 24px 4px 24px',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: '0 24px',
        // minHeight: 300,
    },
};

class DownloadDialog extends Component {
    static propTypes = {
        open: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    render() {
        const { open, onClose, classes } = this.props;

        return (
            <Dialog open={open} onClose={onClose}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {i18n.t('Download map')}
                </DialogTitle>
                <DialogContent className={classes.content}>#</DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button color="primary" onClick={this.onDownload}>
                        {i18n.t('Download')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    onDownload = () => {
        console.log('DOWNLOAD!');

        const mapEl = document.getElementsByClassName('leaflet-container')[0];

        convertToPng(mapEl).then(dataUri =>
            downloadFile(
                dataURItoBlob(dataUri),
                `map-${Math.random()
                    .toString(36)
                    .substring(7)}.png`
            )
        );
    };
}

export default withStyles(styles)(DownloadDialog);
