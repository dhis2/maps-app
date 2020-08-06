import React, { useCallback, useEffect } from 'react';
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

const NumericLegendStyle = props => {
    const {
        mapType,
        method,
        dataItem,
        isSingleColor,
        setClassification,
        setLegendSet,
        style,
    } = props;

    useEffect(() => {
        if (dataItem.legendSet) {
            setClassification(CLASSIFICATION_PREDEFINED);
            setLegendSet(dataItem.legendSet);
        } else {
            setClassification(CLASSIFICATION_EQUAL_INTERVALS);
        }
    }, [dataItem, method, setClassification, setLegendSet]);

    /*
    useEffect(() => {
        if (method === CLASSIFICATION_PREDEFINED && dataItem) {
            setLegendSet(dataItem.legendSet);
        }
    }, [method, dataItem, setLegendSet]);
    */

    return (
        <div style={style}>
            <LegendTypeSelect
                method={method}
                mapType={mapType}
                isSingleColor={isSingleColor}
            />
            {method === CLASSIFICATION_PREDEFINED ? (
                <LegendSetSelect />
            ) : (
                <Classification />
            )}
        </div>
    );
};

/*
export class NumericLegendStyle extends Component {
    static propTypes = {
        method: PropTypes.number,
        legendSet: PropTypes.object,
        dataItem: PropTypes.object,
        setClassification: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { method, legendSet } = this.props;

        if (!method || (method === CLASSIFICATION_PREDEFINED && !legendSet)) {
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
                {method === CLASSIFICATION_PREDEFINED ? (
                    <LegendSetSelect />
                ) : (
                    <Classification />
                )}
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
                setClassification(CLASSIFICATION_PREDEFINED);
                setLegendSet(dataItem.legendSet);
            } else {
                setClassification(CLASSIFICATION_EQUAL_INTERVALS);
            }
        }

        if (
            method !== prevMethod &&
            method === CLASSIFICATION_PREDEFINED &&
            dataItem
        ) {
            setLegendSet(dataItem.legendSet);
        }
    }
}
*/

NumericLegendStyle.propTypes = {
    mapType: PropTypes.string,
    method: PropTypes.number,
    isSingleColor: PropTypes.bool,
    legendSet: PropTypes.object,
    dataItem: PropTypes.object,
    setClassification: PropTypes.func.isRequired,
    setLegendSet: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        legendSet: layerEdit.legendSet,
        isSingleColor: layerEdit.colorScale.split(',').length === 1,
    }),
    { setClassification, setLegendSet }
)(NumericLegendStyle);
