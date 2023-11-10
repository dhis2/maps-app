import PropTypes from 'prop-types'
import { DAILY, WEEKLY } from '@dhis2/analytics'
import React from 'react'
import PeriodReducer from './PeriodReducer.js'
import PeriodSelect from './PeriodSelect.js'

const reducerPeriods = [DAILY, WEEKLY]

const EarthEnginePeriodTab = ({
    datasetId,
    filters,
    periodType,
    period,
    periodRange,
    periodReducer,
    onChange,
    onError,
    errorText,
    className,
}) => {
    return (
        <div className={className}>
            {reducerPeriods.includes(periodType) ? (
                <PeriodReducer
                    datasetId={datasetId}
                    defaultPeriodType={periodType}
                    period={period}
                    range={periodRange}
                    reducer={periodReducer}
                    onChange={onChange}
                    errorText={errorText}
                />
            ) : (
                <PeriodSelect
                    datasetId={datasetId}
                    periodType={periodType}
                    period={period}
                    filters={filters}
                    onChange={onChange}
                    onError={onError}
                    errorText={errorText}
                />
            )}
        </div>
    )
}

EarthEnginePeriodTab.propTypes = {
    datasetId: PropTypes.string.isRequired,
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.object,
}

export default EarthEnginePeriodTab
