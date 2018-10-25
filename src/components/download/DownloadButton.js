import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DownloadDialog from './DownloadDialog';
import { setDownloadState } from '../../actions/download';

const styles = {
    button: {
        height: 38,
        lineHeight: '22px', // To align with File button
    },
    label: {
        textTransform: 'none',
        fontSize: 16,
        fontWeight: 400,
    },
};

class DownloadButton extends Component {
    static propTypes = {
        setDownloadState: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    render() {
        const { isOpen, classes } = this.props;

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
                <DownloadDialog />
            </React.Fragment>
        );
    }

    onClick = () => this.props.setDownloadState(true);
}

export default connect(
    null,
    { setDownloadState }
)(withStyles(styles)(DownloadButton));
