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
        id: LABEL_DISPLAY_OPTION_NAME_ONLY,
        name: i18n.t('Name'),
    },
    {
        id: LABEL_DISPLAY_OPTION_NAME_AND_VALUE,
        name: i18n.t('Name and value'),
    },
    {
        id: LABEL_DISPLAY_OPTION_VALUE_ONLY,
        name: i18n.t('Value'),
    },
];

export const LabelOptions = ({ option, onDisplayOptionChange }) => (
    <RadioGroup
        value={parseInt(
            option !== undefined ? option : LABEL_DISPLAY_OPTION_NAME_ONLY,
            10
        )}
        onChange={val => onDisplayOptionChange(val)}
    >
        {getLabelOptions().map(({ id, name }) => (
            <Radio key={id} value={id} label={name} />
        ))}
    </RadioGroup>
);

LabelOptions.propTypes = {
    option: PropTypes.number,
    onDisplayOptionChange: PropTypes.func.isRequired,
};

export default LabelOptions;
