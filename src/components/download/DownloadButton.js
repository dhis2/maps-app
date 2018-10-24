import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DownloadDialog from './DownloadDialog';

const styles = {
    button: {
        top: -1, // To align with File button
    },
    label: {
        textTransform: 'none',
        fontSize: 16,
        fontWeight: 400,
    },
};

class DownloadButton extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    state = {
        dialogOpen: false,
    };

    render() {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <Button
                    key="button"
                    onClick={this.onClick}
                    classes={{
                        root: classes.button,
                        label: classes.label,
                    }}
                >
                    {i18n.t('Download')}
                </Button>
                <DownloadDialog
                    open={this.state.dialogOpen}
                    onClose={this.onDownloadDialogClose}
                />
            </React.Fragment>
        );
    }

    onClick = () =>
        this.setState({
            dialogOpen: true,
        });

    onDownloadDialogClose = () =>
        this.setState({
            dialogOpen: false,
        });
}

export default withStyles(styles)(DownloadButton);
