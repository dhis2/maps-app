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
import { loadLayer } from '../../actions/layers';
import { clearAnalyticalObject } from '../../actions/analyticalObject';
import {
    getDataDimensionsFromAnalyticalObject,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject';

const styles = {
    content: {
        minHeight: 80,
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
        loadLayer: PropTypes.func.isRequired,
        clearAnalyticalObject: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        selectedDataDims: [],
    };

    componentDidUpdate(prevProps) {
        const { ao } = this.props;

        if (ao && ao !== prevProps.ao) {
            this.setDefaultState();
        }
    }

    setDefaultState() {
        const dataDims = getDataDimensionsFromAnalyticalObject(this.props.ao);

        // Select the first data dimension
        if (dataDims && dataDims.length) {
            this.onSelectDataDim([dataDims[0].id]);
        }
    }

    render() {
        const { ao, showDialog, clearAnalyticalObject, classes } = this.props;
        const { selectedDataDims } = this.state;

        if (!showDialog) {
            return null;
        }

        const dataDims = getDataDimensionsFromAnalyticalObject(ao);
        const disableProceedBtn = !selectedDataDims.length;

        return (
            <Dialog open={showDialog} onClose={this.onClose}>
                <DialogTitle disableTypography={true}>
                    {i18n.t('Open as map')}
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {dataDims.length > 1 && (
                        <Fragment>
                            <div className={classes.description}>
                                {i18n.t(
                                    'This chart/table contains {{numDimensions}} data dimensions. Choose which dimensions you want to import from the list below. Each dimension will be created as a map layer.',
                                    {
                                        numDimensions: dataDims.length,
                                    }
                                )}
                            </div>
                            <SelectField
                                label={i18n.t('Data dimensions')}
                                items={dataDims}
                                value={selectedDataDims}
                                multiple={true}
                                onChange={this.onSelectDataDim}
                            />
                        </Fragment>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={clearAnalyticalObject}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        disabled={disableProceedBtn}
                        color="primary"
                        onClick={this.onProceedClick}
                    >
                        {i18n.t('Proceed')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    onSelectDataDim = selectedDataDims => {
        this.setState({ selectedDataDims });
    };

    onProceedClick = async () => {
        const { ao, loadLayer, clearAnalyticalObject } = this.props;
        const dataDims = [...this.state.selectedDataDims].reverse();
        const lastDataId = dataDims[dataDims.length - 1];

        // Call in sequence
        for (const dataId of dataDims) {
            loadLayer(
                await getThematicLayerFromAnalyticalObject(
                    ao,
                    dataId,
                    dataId === lastDataId
                )
            );
        }

        clearAnalyticalObject();
    };
}

export default connect(
    state => ({
        showDialog: !!state.analyticalObject,
        ao: state.analyticalObject,
    }),
    {
        loadLayer,
        clearAnalyticalObject,
    }
)(withStyles(styles)(OpenAsMapDialog));
