import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LegendTypeSelect from './LegendTypeSelect';
import LegendSetSelect from './LegendSetSelect';
import Classification from './Classification';
import { setClassification, setLegendSet } from '../../actions/layerEdit';
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../constants/layers';

// Wrapper component for selecting legend style used for numeric map styles
export class NumericLegendStyle extends Component {
    static propTypes = {
        method: PropTypes.number,
        dataItem: PropTypes.object,
        setClassification: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        if (!this.props.method) {
            this.setDefaultLegendStyle();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataItem) {
            this.setDefaultLegendStyle(prevProps.method, prevProps.dataItem);
        }
    }

    render() {
        const { method, style } = this.props;

        return (
            <div style={style}>
                <LegendTypeSelect method={method} />
                {method == 1 ? <LegendSetSelect /> : <Classification />}
            </div>
        );
    }

    // Set default classification method and legend set
    setDefaultLegendStyle(prevMethod, prevDataItem) {
        const {
            method,
            dataItem,
            setClassification,
            setLegendSet,
        } = this.props;

        if (dataItem !== prevDataItem) {
            if (dataItem.legendSet) {
                setClassification(Number(CLASSIFICATION_PREDEFINED));
                setLegendSet(dataItem.legendSet);
            } else {
                setClassification(Number(CLASSIFICATION_EQUAL_INTERVALS));
            }
        }

        if (method !== prevMethod && method == CLASSIFICATION_PREDEFINED) {
            setLegendSet(dataItem.legendSet);
        }
    }
}

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
    }),
    { setClassification, setLegendSet }
)(NumericLegendStyle);
