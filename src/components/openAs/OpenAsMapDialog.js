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
import { clearAnalyticalObject } from '../../actions/analyticalObject';

const styles = {
    content: {
        minHeight: 80,
        // width: 250,
    },
};

export class OpenAsMapDialog extends Component {
    static propTypes = {
        showDialog: PropTypes.bool.isRequired,
        ao: PropTypes.object,
        clearAnalyticalObject: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    // TODO: Use state?
    getIssues() {
        const { ao } = this.props;
        const { columns, rows, filters } = ao;
        const dimensions = [...columns, ...rows, ...filters];
        const dataItems = dimensions.filter(i => i.dimension === 'dx');
        const issues = [];

        if (dataItems.length && dataItems[0].items.length > 1) {
            issues.push(
                `Only a single data dimension will be shown on the map. The data element that comes first in the chart data. You can reorder data elements in the 'Data' modal`
            );
        }

        return issues;
    }

    render() {
        const { showDialog, clearAnalyticalObject, classes } = this.props;

        if (!showDialog) {
            return null;
        }

        const issues = this.getIssues();

        return (
            <Dialog open={showDialog} onClose={this.onClose}>
                <DialogTitle disableTypography={true}>
                    {i18n.t('Open as map')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {issues.map((issue, index) => (
                        <div key={index}>{issue}</div>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={clearAnalyticalObject}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button color="primary" onClick={() => {}}>
                        {i18n.t('Proceed')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(
    state => ({
        showDialog: !!state.analyticalObject,
        ao: state.analyticalObject,
    }),
    {
        clearAnalyticalObject,
    }
)(withStyles(styles)(OpenAsMapDialog));
