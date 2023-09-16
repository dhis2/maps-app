import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import PeriodReducer from './PeriodReducer.js'
import styles from './styles/PeriodSelect.module.css'

const EarthEnginePeriodTab = ({
    datasetId,
    periodType,
    period,
    periods,
    onChange,
    errorText,
    className,
}) => {
    return (
        <div className={className}>
            {periodType === 'daily' && (
                <PeriodReducer
                    datasetId={datasetId}
                    period={period}
                    onChange={onChange}
                    errorText={errorText}
                />
            )}
        </div>
    )
}

EarthEnginePeriodTab.propTypes = {
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.object,
    periods: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
}

export default EarthEnginePeriodTab
