import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { LAST_UPDATED_DATES } from '../../../constants/periods.js'
import { Radio, RadioGroup } from '../../core/index.js'
import styles from './styles/PeriodTypeSelect.module.css'

const PeriodTypeSelect = ({
    program,
    periodType = LAST_UPDATED_DATES,
    onChange,
}) => {
    const label = i18n.t(
        'Select period when tracked entities were last updated'
    )

    return program ? (
        <RadioGroup
            name="type"
            value={periodType}
            onChange={(type) => onChange({ value: type })}
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
    )
}

PeriodTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    periodType: PropTypes.string,
    program: PropTypes.object,
}

export default PeriodTypeSelect
