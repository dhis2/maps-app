import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import PeriodReducer from './PeriodReducer.js'
import PeriodSelect from './PeriodSelect.js'
import PeriodRange from './PeriodRange.js'

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
            {periodType === 'range' ? (
                <PeriodRange
                    datasetId={datasetId}
                    period={period}
                    reducer={periodReducer}
                    onChange={onChange}
                    errorText={errorText}
                />
            ) : periodType === 'DAILY' || periodType === 'WEEKLY' ? (
                <PeriodReducer
                    defaultPeriodType={periodType}
                    datasetId={datasetId}
                    period={period}
                    range={periodRange}
                    reducer={periodReducer}
                    onChange={onChange}
                    errorText={errorText}
                />
            ) : (
                <PeriodSelect
                    periodType={periodType}
                    datasetId={datasetId}
                    filters={filters}
                    period={period}
                    onChange={onChange}
                    onError={onError}
                    errorText={errorText}
                />
            )}
        </div>
    )
}

EarthEnginePeriodTab.propTypes = {
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.object,
}

export default EarthEnginePeriodTab
