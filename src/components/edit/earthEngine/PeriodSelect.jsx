import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
    BY_YEAR,
    EE_MONTHLY,
    EE_WEEKLY,
    EE_DAILY,
} from '../../../constants/periods.js'
import usePrevious from '../../../hooks/usePrevious.js'
import { getPeriods, getYears } from '../../../util/earthEngine.js'
import { SelectField } from '../../core/index.js'
import styles from './styles/PeriodSelect.module.css'

const AVAILABLE_UP_TO = 'Available up to:'
const isPeriodComplete = ({ endDateDataset, endDatePeriod, periodName }) => {
    const complete = endDateDataset >= endDatePeriod

    const name = complete
        ? periodName
        : `${periodName} (${AVAILABLE_UP_TO} ${endDateDataset
              .toISOString()
              .slice(0, 10)})`

    return { complete, name }
}

const EarthEnginePeriodSelect = ({
    periodType,
    periodReducer,
    period,
    datasetId,
    layerId,
    filters,
    onChange,
    onError,
    errorText,
    className,
}) => {
    const engine = useDataEngine()
    const prevLayerId = usePrevious(layerId)
    const [periods, setPeriods] = useState()
    const prevPeriods = usePrevious(periods)
    const [year, setYear] = useState()
    const trackedYear = useRef(year)
    const [years, setYears] = useState()
    const [datesRange, setDatesRange] = useState()
    const [loadingPeriods, setLoadingPeriods] = useState(false)
    const byYear = [BY_YEAR, EE_MONTHLY, EE_WEEKLY, EE_DAILY].includes(
        periodType
    )

    const handlePeriodChange = useCallback(
        (e) => {
            let name = e.name
            if (name.includes(AVAILABLE_UP_TO)) {
                const regex = new RegExp(`\\s*\\(${AVAILABLE_UP_TO}.*\\)$`)
                name = name.replace(regex, '')
            }
            onChange({
                ...e,
                name,
            })
        },
        [onChange]
    )

    // Get years for dataset
    useEffect(() => {
        let isCancelled = false
        getYears({ datasetId, engine })
            .then(({ startYear, endYear, startDate, endDate }) => {
                if (!isCancelled) {
                    setDatesRange({ startDate, endDate })
                    if (byYear) {
                        const years = Array.from(
                            { length: endYear - startYear + 1 },
                            (_, i) => {
                                const year = endYear - i
                                return { id: year, name: String(year) }
                            }
                        )
                        setYears(years)
                    }
                }
            })
            .catch((error) => {
                return onError({
                    type: 'engine',
                    message: error.message,
                })
            })
        return () => (isCancelled = true)
    }, [datasetId, periodReducer, byYear, onError, engine])

    useEffect(() => {
        const layerChanged = prevLayerId !== layerId
        if (byYear && years && period?.year) {
            const newYear = year ?? period.year
            setYear(newYear)
            trackedYear.current = newYear
        } else if (
            !layerChanged &&
            byYear &&
            years &&
            !years.some((y) => y.id === year)
        ) {
            const newYear = years[0].id
            // Set year to latest available year by default
            setYear(newYear)
            trackedYear.current = newYear
        }
    }, [layerId, period, byYear, year, years])

    // Get periods for dataset and selected year
    useEffect(() => {
        let isCancelled = false
        if (periodType && datesRange && (!byYear || year)) {
            setLoadingPeriods(true)
            getPeriods({
                datasetId,
                periodType,
                periodReducer,
                year,
                datesRange,
                filters,
                engine,
            })
                .then((periods) => {
                    if (!isCancelled) {
                        const { name } = isPeriodComplete({
                            endDateDataset: datesRange.endDate,
                            endDatePeriod: periods[0].endDate,
                            periodName: periods[0].name,
                        })
                        periods[0].name = name
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
    }, [
        datasetId,
        periodType,
        periodReducer,
        byYear,
        year,
        datesRange,
        filters,
        onError,
        engine,
    ])

    useEffect(() => {
        const periodsChanged = prevPeriods !== periods
        const yearChanged = trackedYear.current !== year
        const layerChanged = prevLayerId !== layerId
        if (periodsChanged && Array.isArray(periods) && periods.length) {
            if (
                !yearChanged &&
                period &&
                periods.find(({ id }) => id === period.id)
            ) {
                onChange(period)
                trackedYear.current = year
            } else if (!layerChanged) {
                // Set most recent complete period by default
                const { complete } = isPeriodComplete({
                    endDateDataset: datesRange.endDate,
                    endDatePeriod: periods[0].endDate,
                    periodName: periods[0].name,
                })
                const defaultPeriod =
                    complete || periods.length === 1 ? periods[0] : periods[1]
                onChange(defaultPeriod)
                trackedYear.current = year
            }
        }
    }, [layerId, year, periods, period, datesRange?.endDate, onChange])

    const items = periods

    return (
        <div className={styles.flexColumn}>
            <NoticeBox className={styles.notice}>
                {i18n.t('Available periods are retrieved from the source data')}
            </NoticeBox>
            {items ? (
                <div className={className}>
                    {byYear && (
                        <SelectField
                            label={i18n.t('Year')}
                            items={years}
                            value={year}
                            onChange={({ id }) => {
                                setYear(id)
                            }}
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
                        onChange={handlePeriodChange}
                        errorText={!period && errorText ? errorText : null}
                        className={styles.period}
                    />
                </div>
            ) : (
                <div className={styles.loading}>
                    <CircularLoader small />
                    {i18n.t('Loading periods')}
                </div>
            )}
        </div>
    )
}

EarthEnginePeriodSelect.propTypes = {
    datasetId: PropTypes.string.isRequired,
    layerId: PropTypes.string.isRequired,
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    filters: PropTypes.array,
    period: PropTypes.object,
    periodReducer: PropTypes.string,
}

export default EarthEnginePeriodSelect
