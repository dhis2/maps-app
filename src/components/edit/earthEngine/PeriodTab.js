import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import PeriodReducer from './PeriodReducer.js'
import PeriodSelect from './PeriodSelect.js'
import styles from './styles/PeriodSelect.module.css'

const EarthEnginePeriodTab = ({
    datasetId,
    filters,
    periodType,
    period,
    periodReducer,
    onChange,
    onError,
    errorText,
    className,
}) => {
    // TODO: Add support for date range
    if (periodType === 'range') {
        return null
    }

    return (
        <div className={className}>
            {periodType === 'daily' ? (
                <PeriodReducer
                    datasetId={datasetId}
                    period={period}
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
    // periods: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
}

export default EarthEnginePeriodTab
