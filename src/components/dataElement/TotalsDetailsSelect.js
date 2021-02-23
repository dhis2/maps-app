import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Radio, RadioGroup } from '../core';

const TotalsDetailsSelect = ({ operand, onChange }) => (
    <RadioGroup
        name="operand"
        value={operand === true ? 'details' : 'totals'}
        onChange={value => onChange(value === 'details')}
        display="row"
    >
        <Radio value="totals" label={i18n.t('Totals')} />
        <Radio value="details" label={i18n.t('Details')} />
    </RadioGroup>
);

TotalsDetailsSelect.propTypes = {
    operand: PropTypes.bool, // true = 'details'
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default TotalsDetailsSelect;
