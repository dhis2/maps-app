import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { getPeriodTypes, getRelativePeriods } from '../../util/periods.js'
import { SelectField } from '../core/index.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'

const PeriodTypeSelect = ({
    onChange,
    className,
    errorText,
    includeRelativePeriods = true,
    period,
    value,
}) => {
    const { hiddenPeriods } = useSystemSettings()

    const periodTypes = useMemo(
        () => getPeriodTypes(includeRelativePeriods, hiddenPeriods),
        [includeRelativePeriods, hiddenPeriods]
    )

    // Set default period type
    useEffect(() => {
        if (!value) {
            const isRelativePeriod =
                includeRelativePeriods &&
                getRelativePeriods().find((p) => p.id === period.id)

            if (!period || isRelativePeriod) {
                // default to first period type
                onChange(periodTypes[0], isRelativePeriod)
            }
        }
    }, [value, period, includeRelativePeriods, onChange])

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
    includeRelativePeriods: PropTypes.bool,
    period: PropTypes.object,
    value: PropTypes.string,
}

export default PeriodTypeSelect
