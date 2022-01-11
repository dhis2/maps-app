import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../../core';
import { getProgramStatuses } from '../../../constants/programStatuses';

const ProgramStatusSelect = ({ value = 'ALL', onChange, className }) => (
    <SelectField
        label={i18n.t('Program status')}
        items={getProgramStatuses()}
        value={value}
        onChange={valueType => onChange(valueType.id)}
        className={className}
    />
);

ProgramStatusSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default ProgramStatusSelect;
