import { useCachedDataQuery } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo, useEffect } from 'react'
import { getPeriodTypes, getRelativePeriods } from '../../util/periods.js'
import { SelectField } from '../core/index.js'

const PeriodTypeSelect = ({
    onChange,
    className,
    errorText,
    includeRelativePeriods,
    period,
    value,
}) => {
    const { systemSettings } = useCachedDataQuery()
    const { hiddenPeriods } = systemSettings

    const periodTypes = useMemo(
        () => getPeriodTypes(includeRelativePeriods, hiddenPeriods),
        [includeRelativePeriods, hiddenPeriods]
    )

    // Set default period type
    useEffect(() => {
        if (!value) {
            const isRelativePeriod = !!(
                includeRelativePeriods &&
                period &&
                getRelativePeriods().find((p) => p.id === period.id)
            )

            if (!period || isRelativePeriod) {
                console.log(
                    '🚀 ~ useEffect ~ isRelativePeriod:',
                    isRelativePeriod
                )
                console.log('🚀 ~ useEffect ~ periodTypes[0]:', periodTypes[0])
                // default to first period type
                onChange(periodTypes[0], isRelativePeriod)
            }
        }
    }, [value, period, periodTypes, includeRelativePeriods, onChange])

    return (
        <SelectField
            label={i18n.t('Period type')}
            items={periodTypes}
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
    includeRelativePeriods: PropTypes.bool,
    period: PropTypes.object,
    value: PropTypes.string,
}

export default PeriodTypeSelect
