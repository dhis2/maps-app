import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Radio, RadioGroup } from '.';
import {
    LABEL_TEMPLATE_NAME_ONLY,
    LABEL_TEMPLATE_NAME_AND_VALUE,
    LABEL_TEMPLATE_VALUE_ONLY,
} from '../../constants/layers';

const getLabelDisplayOptions = () => [
    {
        value: LABEL_TEMPLATE_NAME_ONLY,
        label: i18n.t('Name'),
    },
    {
        value: LABEL_TEMPLATE_NAME_AND_VALUE,
        label: i18n.t('Name and value'),
    },
    {
        value: LABEL_TEMPLATE_VALUE_ONLY,
        label: i18n.t('Value'),
    },
];

export const LabelDisplayOptions = ({ option, onDisplayOptionChange }) => (
    <RadioGroup
        value={option || LABEL_TEMPLATE_NAME_ONLY}
        onChange={onDisplayOptionChange}
    >
        {getLabelDisplayOptions().map(({ value, label }) => (
            <Radio key={value} value={value} label={label} />
        ))}
    </RadioGroup>
);

LabelDisplayOptions.propTypes = {
    option: PropTypes.string,
    onDisplayOptionChange: PropTypes.func.isRequired,
};

export default LabelDisplayOptions;
