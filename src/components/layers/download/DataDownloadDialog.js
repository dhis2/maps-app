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
import CircularProgress from '@material-ui/core/CircularProgress';
import SelectField from '../../core/SelectField';

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
});

const formatOptionsFlat = ['ID', 'Code', 'Name'];
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
    };

    onChangeFormatOption = newValue => {
        this.setState({ selectedFormatOption: newValue.id - 1 });
    };

    render() {
        const {
            open,
            downloading,
            layer,
            startDownload,
            closeDialog,

            classes,
        } = this.props;

        return (
            <Dialog open={open} classes={{ paper: classes.paper }}>
                <DialogTitle disableTypography={true} className={classes.title}>
                    {i18n.t('Download Event Layer Data')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <p>
                        You are about to download the data for this layer in
                        GeoJSON format.
                    </p>
                    <p>Please select the format for GeoJSON Feature keys</p>
                    <SelectField
                        label={i18n.t('Meta-data ID Format')}
                        items={formatOptions}
                        value={this.state.selectedFormatOption + 1}
                        onChange={this.onChangeFormatOption}
                    />
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
                            onClick={() => startDownload(layer)}
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
        console.error('Tried to open data download dialog without specifying a source layer!');
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
