import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import { getProgramStatuses } from '../../../constants/programStatuses';

const ProgramStatusSelect = ({ value = 'ALL', onChange, style }) => (
    <SelectField
        label={i18n.t('Program status')}
        items={getProgramStatuses()}
        value={value}
        onChange={valueType => onChange(valueType.id)}
        style={style}
    />
);

ProgramStatusSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default ProgramStatusSelect;
