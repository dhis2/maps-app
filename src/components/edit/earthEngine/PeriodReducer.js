import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import PeriodTypeSelect from '../../periods/PeriodTypeSelect.js'
import PeriodSelect from '../../periods/PeriodSelect.js'
import StartEndDates from '../../periods/StartEndDates.js'
import { START_END_DATES } from '../../../constants/periods.js'
import { getTimeRange } from '../../../util/earthEngine.js'

const EarthEnginePeriodReducer = ({
    datasetId,
    period,
    onChange,
    errorText,
    className,
}) => {
    const [periodType, setPeriodType] = useState()
    const [dateRange, setDateRange] = useState()

    useEffect(() => {
        getTimeRange(datasetId).then(setDateRange)
    }, [datasetId])

    // TODO: Add loading spinner
    return (
        <div className={className}>
            <PeriodTypeSelect
                value={periodType}
                onChange={(period) => setPeriodType(period.id)}
            />
            {dateRange &&
                periodType &&
                (periodType === START_END_DATES ? (
                    <StartEndDates
                    // startDate={startDate}
                    // endDate={endDate}
                    // className={styles.periodSelect}
                    // errorText={errorText}
                    />
                ) : (
                    <PeriodSelect
                        periodType={periodType}
                        period={period}
                        {...dateRange}
                        onChange={onChange}
                        errorText={errorText}
                    />
                ))}
        </div>
    )
}

EarthEnginePeriodReducer.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.object,
}

export default EarthEnginePeriodReducer
