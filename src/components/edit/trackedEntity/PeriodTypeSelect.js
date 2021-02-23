import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Radio, RadioGroup } from '../../core';
import { setPeriodType } from '../../../actions/layerEdit';
import styles from './styles/PeriodTypeSelect.module.css';

export const PeriodTypeSelect = ({
    program,
    periodType = 'lastUpdated',
    setPeriodType,
}) => {
    const label = i18n.t(
        'Select period when tracked entities were last updated'
    );

    return program ? (
        <RadioGroup
            name="type"
            value={periodType}
            onChange={type => setPeriodType({ id: type })}
        >
            <Radio value="lastUpdated" label={label} />
            <Radio
                value="program"
                label={`${i18n.t('Program/Enrollment date')}: ${i18n.t(
                    'the date a tracked entity was registered or enrolled in a program'
                )}`}
            />
        </RadioGroup>
    ) : (
        <div className={styles.label}>{label}:</div>
    );
};

PeriodTypeSelect.propTypes = {
    periodType: PropTypes.string,
    program: PropTypes.object,
    setPeriodType: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        program: layerEdit.program,
        periodType: layerEdit.periodType,
    }),
    { setPeriodType }
)(PeriodTypeSelect);
