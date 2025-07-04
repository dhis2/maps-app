import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { START_END_DATES } from '../../constants/periods.js'
import { getRelativePeriods } from '../../util/periods.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SelectField } from '../core/index.js'

const RelativePeriodSelect = ({
    startEndDates,
    period,
    onChange,
    className,
    errorText,
}) => {
    const { systemSettings } = useCachedData()
    const hiddenPeriods = systemSettings.hiddenPeriods

    const periods = useMemo(
        () =>
            (startEndDates
                ? [
                      {
                          id: START_END_DATES,
                          name: i18n.t('Start/end dates'),
                      },
                  ]
                : []
            ).concat(getRelativePeriods(hiddenPeriods)),
        [hiddenPeriods, startEndDates]
    )

    const value =
        period && periods.find((p) => p.id === period.id) ? period.id : null

    return (
        <SelectField
            label={i18n.t('Period')}
            items={periods}
            value={value}
            onChange={onChange}
            className={className}
            errorText={!value && errorText ? errorText : null}
            dataTest="relative-period-select"
        />
    )
}

RelativePeriodSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
    startEndDates: PropTypes.bool,
}

export default RelativePeriodSelect
