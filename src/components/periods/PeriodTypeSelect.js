import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { RELATIVE_PERIODS } from '../../constants/periods.js'
import { getPeriodTypes, getRelativePeriods } from '../../util/periods.js'
import { SelectField } from '../core/index.js'

const PeriodTypeSelect = ({
    onChange,
    className,
    errorText,
    hiddenPeriods,
    period,
    value,
}) => {
    useEffect(() => {
        const relativePeriodType = {
            id: RELATIVE_PERIODS,
            name: i18n.t('Relative'),
        }

        if (!value && period) {
            if (getRelativePeriods().find((p) => p.id === period.id)) {
                // false will not clear the period dropdown
                onChange(relativePeriodType, false)
            }
        } else if (!value) {
            // set relativePeriods as default
            onChange(relativePeriodType)
        }
    }, [value, period, onChange])

    return (
        <SelectField
            label={i18n.t('Period type')}
            items={getPeriodTypes(hiddenPeriods)}
            value={value}
            onChange={onChange}
            className={className}
            errorText={!value && errorText ? errorText : null}
            dataTest="periodtypeselect"
        />
    )
}

PeriodTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    hiddenPeriods: PropTypes.array,
    period: PropTypes.object,
    value: PropTypes.string,
}

export default PeriodTypeSelect
