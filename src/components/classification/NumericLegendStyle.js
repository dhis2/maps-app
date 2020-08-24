import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LegendTypeSelect from './LegendTypeSelect';
import LegendSetSelect from './LegendSetSelect';
import Classification from './Classification';
import SingleColor from './SingleColor';
import { setClassification, setLegendSet } from '../../actions/layerEdit';
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_SINGLE_COLOR,
} from '../../constants/layers';

// Wrapper component for selecting legend style used for numeric map styles
const NumericLegendStyle = props => {
    const {
        mapType,
        method,
        dataItem,
        setClassification,
        setLegendSet,
        legendSetError,
        style,
    } = props;

    const isSingleColor = method === CLASSIFICATION_SINGLE_COLOR;
    const isPredefined = method === CLASSIFICATION_PREDEFINED;

    useEffect(() => {
        // Set default classification method
        if (!method) {
            // Use predefined legend if defined for data item
            if (dataItem && dataItem.legendSet) {
                setClassification(CLASSIFICATION_PREDEFINED);
                setLegendSet(dataItem.legendSet);
            } else {
                setClassification(CLASSIFICATION_EQUAL_INTERVALS);
            }
        }
    }, [method, dataItem, setClassification, setLegendSet]);

    return (
        <div style={style}>
            <LegendTypeSelect
                method={method}
                mapType={mapType}
                dataItem={dataItem}
            />
            {isSingleColor ? (
                <SingleColor />
            ) : isPredefined ? (
                <LegendSetSelect legendSetError={legendSetError} />
            ) : (
                <Classification />
            )}
        </div>
    );
};

NumericLegendStyle.propTypes = {
    mapType: PropTypes.string,
    method: PropTypes.number,
    colorScale: PropTypes.string,
    legendSet: PropTypes.object,
    legendSetError: PropTypes.string,
    dataItem: PropTypes.object,
    setClassification: PropTypes.func.isRequired,
    setLegendSet: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        legendSet: layerEdit.legendSet,
    }),
    { setClassification, setLegendSet }
)(NumericLegendStyle);
