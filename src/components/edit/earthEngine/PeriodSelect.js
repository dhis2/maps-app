import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
// import styles from './styles/PeriodSelect.module.css';

const PeriodSelect = ({ period, periods, onChange, className }) => (
    <div className={className}>
        <SelectField
            label={i18n.t('Period')}
            loading={!periods}
            items={periods}
            value={period}
            onChange={onChange}
            className={className}
        />
    </div>
);

PeriodSelect.propTypes = {
    period: PropTypes.number,
    periods: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default PeriodSelect;
