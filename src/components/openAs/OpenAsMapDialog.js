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
import SelectField from '../core/SelectField';
import { clearAnalyticalObject } from '../../actions/analyticalObject';

const styles = {
    content: {
        minHeight: 80,
        // width: 250,
    },
    description: {
        fontSize: 14,
        lineHeight: '20px',
        paddingBottom: 8,
    },
};

export class OpenAsMapDialog extends Component {
    static propTypes = {
        showDialog: PropTypes.bool.isRequired,
        ao: PropTypes.object,
        clearAnalyticalObject: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        selectedDataDims: ['Uvn6LCg7dVU'],
    };

    getDataDimensions() {
        const { ao } = this.props;
        const { columns, rows, filters } = ao;
        // TODO: Should filters be included?
        const dims = [...columns, ...rows, ...filters];
        const dataDims = dims.filter(i => i.dimension === 'dx');

        if (dataDims.length > 1) {
            console.log('TODO: More than one dx dimension');
        } else if (dataDims.length) {
            return dataDims[0].items;
        }

        return null;
    }

    render() {
        const { showDialog, clearAnalyticalObject, classes } = this.props;
        const { selectedDataDims } = this.state;

        if (!showDialog) {
            return null;
        }

        const dataDims = this.getDataDimensions();

        console.log('ao', dataDims, selectedDataDims);

        return (
            <Dialog open={showDialog} onClose={this.onClose}>
                <DialogTitle disableTypography={true}>
                    {i18n.t('Open as map')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {dataDims && dataDims.length > 1 && (
                        <Fragment>
                            <div className={classes.description}>
                                The chart or pivot contains {dataDims.length}{' '}
                                data dimensions. Select the dimensions you want
                                to see below. One thematic layer will be created
                                for each data dimension. You can toggle the
                                visibility of the layers in the left panel.
                            </div>
                            <SelectField
                                label={i18n.t('Data dimensions')}
                                items={dataDims}
                                value={selectedDataDims}
                                multiple={true}
                                onChange={this.onSelectDataDim}
                                // style={style}
                            />
                        </Fragment>
                    )}
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

    onSelectDataDim = selectedDataDims => {
        this.setState({ selectedDataDims });
    };
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
