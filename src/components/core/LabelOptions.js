import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Radio, RadioGroup } from '../core';
import {
    LABEL_DISPLAY_OPTION_NAME_ONLY,
    LABEL_DISPLAY_OPTION_NAME_AND_VALUE,
    LABEL_DISPLAY_OPTION_VALUE_ONLY,
} from '../../constants/layers';

const getLabelOptions = () => [
    {
        value: LABEL_DISPLAY_OPTION_NAME_ONLY,
        label: i18n.t('Name'),
    },
    {
        value: LABEL_DISPLAY_OPTION_NAME_AND_VALUE,
        label: i18n.t('Name and value'),
    },
    {
        value: LABEL_DISPLAY_OPTION_VALUE_ONLY,
        label: i18n.t('Value'),
    },
];

export const LabelOptions = ({ option, onDisplayOptionChange }) => (
    <RadioGroup
        value={option !== undefined ? option : LABEL_DISPLAY_OPTION_NAME_ONLY}
        onChange={val => onDisplayOptionChange(val)}
    >
        {getLabelOptions().map(({ value, label }) => (
            <Radio key={value} value={value} label={label} />
        ))}
    </RadioGroup>
);

LabelOptions.propTypes = {
    option: PropTypes.string,
    onDisplayOptionChange: PropTypes.func.isRequired,
};

export default LabelOptions;
