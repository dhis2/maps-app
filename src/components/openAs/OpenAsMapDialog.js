import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui';
import { SelectField } from '../core';
import { loadLayer } from '../../actions/layers';
import { clearAnalyticalObject } from '../../actions/analyticalObject';
import {
    getDataDimensionsFromAnalyticalObject,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject';
import styles from './styles/OpenAsMapDialog.module.css';

export class OpenAsMapDialog extends Component {
    static propTypes = {
        showDialog: PropTypes.bool.isRequired,
        ao: PropTypes.object,
        loadLayer: PropTypes.func.isRequired,
        clearAnalyticalObject: PropTypes.func.isRequired,
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
        const { ao, showDialog, clearAnalyticalObject } = this.props;
        const { selectedDataDims } = this.state;

        if (!showDialog) {
            return null;
        }

        const dataDims = getDataDimensionsFromAnalyticalObject(ao);
        const disableProceedBtn = !selectedDataDims.length;

        return (
            <Modal small position="middle" onClose={this.onClose}>
                <ModalTitle>{i18n.t('Open as map')}</ModalTitle>
                <ModalContent>
                    {dataDims.length > 1 && (
                        <div className={styles.content}>
                            <div className={styles.description}>
                                {i18n.t(
                                    'This chart/table contains {{numItems}} data items. Choose which items you want to import from the list below. Each data item will be created as a map layer.',
                                    {
                                        numItems: dataDims.length,
                                    }
                                )}
                            </div>
                            <SelectField
                                label={i18n.t('Data items')}
                                items={dataDims}
                                value={selectedDataDims}
                                multiple={true}
                                onChange={this.onSelectDataDim}
                            />
                        </div>
                    )}
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button secondary onClick={clearAnalyticalObject}>
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            disabled={disableProceedBtn}
                            primary
                            onClick={this.onProceedClick}
                        >
                            {i18n.t('Proceed')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
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
            const layer = await getThematicLayerFromAnalyticalObject(
                ao,
                dataId,
                dataId === lastDataId
            );

            if (layer) {
                loadLayer(layer);
            }
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
)(OpenAsMapDialog);
