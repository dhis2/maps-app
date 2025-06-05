import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { BY_YEAR, EE_MONTHLY } from '../../../constants/periods.js'
import { getPeriods } from '../../../util/earthEngine.js'
import { SelectField } from '../../core/index.js'
import styles from './styles/PeriodSelect.module.css'

const EarthEnginePeriodSelect = ({
    periodType,
    period,
    datasetId,
    filters,
    onChange,
    onError,
    errorText,
    className,
}) => {
    const engine = useDataEngine()
    const [periods, setPeriods] = useState()
    const [yearPeriods, setYearPeriods] = useState()
    const [year, setYear] = useState()
    const byYear = periodType === BY_YEAR || periodType === EE_MONTHLY

    const years = useMemo(
        () =>
            byYear && periods
                ? [...new Set(periods.map((p) => p.year))].map((year) => ({
                      id: year,
                      name: String(year),
                  }))
                : null,
        [byYear, periods]
    )

    const onYearChange = useCallback(({ id }) => {
        setYear(id)
    }, [])

    useEffect(() => {
        let isCancelled = false

        if (periodType) {
            getPeriods({ datasetId, periodType, filters, engine })
                .then((periods) => {
                    if (!isCancelled) {
                        setPeriods(periods)
                    }
                })
                .catch((error) =>
                    onError({
                        type: 'engine',
                        message: error.message,
                    })
                )
        }

        return () => (isCancelled = true)
    }, [datasetId, periodType, filters, onError, engine])

    // Set year from period
    useEffect(() => {
        if (!year && byYear && period) {
            setYear(period.year)
        }
    }, [year, byYear, period])

    // Set most recent period by default
    useEffect(() => {
        if (!period && Array.isArray(periods) && periods.length) {
            onChange(periods[0])
        }
    }, [period, periods, onChange])

    // Set avaiable periods for one year
    useEffect(() => {
        if (byYear && year && periods) {
            setYearPeriods(periods.filter((p) => p.year === year))
        }
    }, [year, byYear, periods])

    // If year is changed, set most recent period for one year
    useEffect(() => {
        if (
            byYear &&
            period &&
            yearPeriods &&
            !yearPeriods.find(({ id }) => id === period.id)
        ) {
            onChange(yearPeriods[0])
        }
    }, [byYear, period, yearPeriods, onChange])

    const items = yearPeriods || periods

    return items ? (
        <div className={className}>
            {byYear && (
                <SelectField
                    label={i18n.t('Year')}
                    items={years}
                    value={year}
                    onChange={onYearChange}
                    className={styles.year}
                />
            )}
            <SelectField
                label={i18n.t('Period')}
                loading={!periods}
                items={items}
                value={
                    items &&
                    period &&
                    items.find(({ id }) => id === period.id) &&
                    period.id
                }
                onChange={onChange}
                helpText={i18n.t(
                    'Available periods are set by the source data'
                )}
                errorText={!period && errorText ? errorText : null}
                className={styles.period}
            />
        </div>
    ) : (
        <div className={styles.loading}>
            <CircularLoader small />
            {i18n.t('Loading periods')}
        </div>
    )
}

EarthEnginePeriodSelect.propTypes = {
    datasetId: PropTypes.string.isRequired,
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    filters: PropTypes.array,
    period: PropTypes.object,
}

export default EarthEnginePeriodSelect
