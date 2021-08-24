import React from 'react';
import PropTypes from 'prop-types';
import { Radio, RadioGroup } from '../core';
import {
    STYLE_TYPE_COLOR,
    getGroupSetStyleTypes,
} from '../../constants/layers';

// Radio buttons to switch between color and symbol for org unit group set
export const StyleTypeSelect = ({ styleType = STYLE_TYPE_COLOR, onChange }) => (
    <RadioGroup value={styleType} display="row" onChange={onChange}>
        {getGroupSetStyleTypes().map(({ id, name }) => (
            <Radio key={id} value={id} label={name} />
        ))}
    </RadioGroup>
);

StyleTypeSelect.propTypes = {
    styleType: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default StyleTypeSelect;
