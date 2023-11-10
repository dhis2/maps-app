import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { SelectField } from '../../core/index.js'
import { getPeriods } from '../../../util/earthEngine.js'
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
    const [periods, setPeriods] = useState()
    const [year, setYear] = useState()
    const byYear = periodType === 'BY_YEAR'

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

    const byYearPeriods = useMemo(
        () =>
            byYear && year && periods
                ? periods.filter((p) => p.year === year)
                : null,
        [byYear, year, periods]
    )

    const onYearChange = useCallback(
        ({ id }) => {
            onChange(null)
            setYear(id)
        },
        [onChange]
    )

    useEffect(() => {
        let isCancelled = false

        if (periodType) {
            getPeriods(datasetId, periodType, filters)
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
    }, [datasetId, periodType, filters, onError])

    // Set most recent period by default
    useEffect(() => {
        if (!period && Array.isArray(periods) && periods.length) {
            onChange(periods[0])
        }
    }, [period, periods, onChange])

    useEffect(() => {
        if (byYear && period) {
            setYear(period.year)
        }
    }, [byYear, period])

    const items = byYear ? byYearPeriods : periods

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
                value={items && period && period.id}
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
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.object,
}

export default EarthEnginePeriodSelect
