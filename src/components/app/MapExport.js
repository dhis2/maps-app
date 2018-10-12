import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {
    calculateExportImageSize,
    convertToPng,
    dataURItoBlob,
    downloadFile,
} from '../../util/export-image-utils';

const styles = {
    button: {
        // position: 'absolute',
        //right: 0,
        //top: 0,
        //borderRadius: 0,
    },
    label: {
        textTransform: 'none',
        fontSize: 16,
        fontWeight: 400,
    },
};

class MapExport extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    render() {
        const { classes } = this.props;

        return (
            <Button
                onClick={this.onClick}
                classes={{
                    root: classes.button,
                    label: classes.label,
                }}
            >
                {i18n.t('Download')}
            </Button>
        );
    }

    onClick = () => {
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

export default withStyles(styles)(MapExport);
