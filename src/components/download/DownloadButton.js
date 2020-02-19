import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import DownloadDialog from './DownloadDialog';
import { toggleDownloadDialog } from '../../actions/download';

const styles = {
    label: {
        textTransform: 'none',
        fontSize: 15,
        fontWeight: 400,
    },
};

export class DownloadButton extends Component {
    static propTypes = {
        toggleDownloadDialog: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Button
                    key="button"
                    onClick={this.onClick}
                    classes={{
                        label: classes.label,
                    }}
                >
                    {i18n.t('Download')}
                </Button>
                <DownloadDialog />
            </Fragment>
        );
    }

    onClick = () => this.props.toggleDownloadDialog(true);
}

export default connect(
    null,
    { toggleDownloadDialog }
)(withStyles(styles)(DownloadButton));
