import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'
import { BY_YEAR, EE_MONTHLY, EE_DAILY } from '../../../constants/periods.js'
import { getPeriods, getYears } from '../../../util/earthEngine.js'
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
    const [year, setYear] = useState()
    const [years, setYears] = useState()
    const [loadingPeriods, setLoadingPeriods] = useState(false)
    const byYear =
        periodType === BY_YEAR ||
        periodType === EE_MONTHLY ||
        periodType === EE_DAILY

    // Get years for dataset
    useEffect(() => {
        let isCancelled = false

        if (byYear) {
            getYears({ datasetId, engine })
                .then(({ startYear, endYear }) => {
                    if (!isCancelled) {
                        const newYears = Array.from(
                            { length: endYear - startYear + 1 },
                            (_, i) => {
                                const year = endYear - i
                                return { id: year, name: String(year) }
                            }
                        )
                        setYears(newYears)
                    }
                })
                .catch((error) => {
                    return onError({
                        type: 'engine',
                        message: error.message,
                    })
                })
        }

        return () => (isCancelled = true)
    }, [datasetId, byYear, onError, engine])

    // Set year to latest available year by default
    useEffect(() => {
        if (byYear && years) {
            setYear(years[0].id)
        }
    }, [byYear, years])

    // Get periods for dataset and selected year
    useEffect(() => {
        let isCancelled = false

        if (periodType && year) {
            setLoadingPeriods(true)

            getPeriods({ datasetId, periodType, year, filters, engine })
                .then((periods) => {
                    if (!isCancelled) {
                        setPeriods(periods)
                        setLoadingPeriods(false)
                    }
                })
                .catch((error) => {
                    return onError({
                        type: 'engine',
                        message: error.message,
                    })
                })
        }

        return () => (isCancelled = true)
    }, [datasetId, periodType, year, filters, onError, engine])

    // Set most recent period by default
    useEffect(() => {
        if (Array.isArray(periods) && periods.length) {
            onChange(periods[0])
        }
    }, [periods, onChange])

    const onYearChange = useCallback(({ id }) => {
        setYear(id)
    }, [])

    const items = periods

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
                loading={loadingPeriods}
                items={!loadingPeriods ? items : null}
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
