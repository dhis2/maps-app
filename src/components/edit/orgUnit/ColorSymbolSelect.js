import React from 'react';
import PropTypes from 'prop-types';
import { Radio, RadioGroup } from '../../core';
import { getGroupSetStyleTypes } from '../../../constants/layers';

// Radio buttons to switch between color and symbol for org unit group set
export const ColorSymbolSelect = ({ styleType = 'color', onChange }) => (
    <RadioGroup value={styleType} display="row" onChange={onChange}>
        {getGroupSetStyleTypes().map(({ id, name }) => (
            <Radio key={id} value={id} label={name} />
        ))}
    </RadioGroup>
);

ColorSymbolSelect.propTypes = {
    styleType: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default ColorSymbolSelect;
