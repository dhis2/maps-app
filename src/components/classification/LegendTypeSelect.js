import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Radio, RadioGroup } from '../core';
import { setClassification } from '../../actions/layerEdit';
import {
    getLegendTypes,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
} from '../../constants/layers';

// Select between user defined (automatic), predefined or single color
export const LegendTypeSelect = ({ mapType, method, setClassification }) =>
    method ? (
        <RadioGroup
            value={
                method === CLASSIFICATION_EQUAL_COUNTS
                    ? CLASSIFICATION_EQUAL_INTERVALS
                    : method
            }
            onChange={method => setClassification(Number(method))}
        >
            {getLegendTypes(mapType === 'BUBBLE').map(({ id, name }) => (
                <Radio key={id} value={id} label={name} />
            ))}
        </RadioGroup>
    ) : null;

LegendTypeSelect.propTypes = {
    method: PropTypes.number,
    mapType: PropTypes.string,
    setClassification: PropTypes.func.isRequired,
};

export default connect(null, { setClassification })(LegendTypeSelect);
