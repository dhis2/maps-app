import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPeriodReducer } from '../../../actions/layerEdit.js'
import { SelectField, DatePicker } from '../../core/index.js'
import PeriodTypeSelect from '../../periods/PeriodTypeSelect.js'
import PeriodSelect from '../../periods/PeriodSelect.js'
import StartEndDates from '../../periods/StartEndDates.js'
import { START_END_DATES } from '../../../constants/periods.js'
import { getTimeRange } from '../../../util/earthEngine.js'
import styles from './styles/PeriodReducer.module.css'

// TOOD: Remove reducers that are less relevant
const periodReducers = [
    {
        id: 'mean',
        name: i18n.t('Mean'),
    },
    {
        id: 'sum',
        name: i18n.t('Sum'),
    },
    {
        id: 'min',
        name: i18n.t('Min'),
    },
    {
        id: 'max',
        name: i18n.t('Max'),
    },
    {
        id: 'median',
        name: i18n.t('Median'),
    },
    {
        id: 'count',
        name: i18n.t('Count'),
    },
    {
        id: 'mode',
        name: i18n.t('Mode'),
    },
    {
        id: 'product',
        name: i18n.t('Product'),
    },
]

const EarthEnginePeriodReducer = ({
    datasetId,
    period,
    // reducer,
    onChange,
    errorText,
    className,
}) => {
    const [periodType, setPeriodType] = useState()
    const [dateRange, setDateRange] = useState()
    const reducer = useSelector((state) => state.layerEdit.periodReducer)
    const dispatch = useDispatch()

    const onPeriodChange = useCallback(
        (period) => onChange(period ? { ...period, periodType } : null),
        [periodType, onChange]
    )

    const onStartEndDateChange = useCallback(
        (reducer) => {
            dispatch(setPeriodReducer(reducer.id))
            // console.log('reducer', reducer)
        },
        [dispatch]
    )

    useEffect(() => {
        getTimeRange(datasetId).then(setDateRange)
    }, [datasetId])

    // TODO: Add loading spinner
    return (
        <div className={className}>
            <PeriodTypeSelect
                value={periodType}
                className={styles.periodSelect}
                onChange={(period) => setPeriodType(period.id)}
            />
            {dateRange && periodType ? (
                <>
                    {periodType === START_END_DATES ? (
                        <>
                            <StartEndDates
                                dateRange={dateRange}
                                startDate={dateRange.firstDate}
                                endDate={dateRange.lastDate}
                                onChange={console.log}
                                className={styles.periodSelect}
                                // errorText={errorText}
                            />
                            <DatePicker
                                label={i18n.t('Start date')}
                                // defaultVal={startDate}
                                onBlur={console.log}
                                // className={className || styles.select}
                            />
                            <DatePicker
                                label={i18n.t('Start date')}
                                // defaultVal={startDate}
                                onBlur={console.log}
                                // className={className || styles.select}
                            />
                        </>
                    ) : (
                        <PeriodSelect
                            periodType={periodType}
                            period={period}
                            {...dateRange}
                            onChange={onPeriodChange}
                            className={styles.periodSelect}
                            errorText={errorText}
                        />
                    )}
                    {periodType !== 'DAILY' && (
                        <SelectField
                            label={i18n.t('Period aggregation method')}
                            items={periodReducers}
                            value={reducer}
                            onChange={onStartEndDateChange}
                            className={styles.reducer}
                        />
                    )}
                </>
            ) : (
                <div className={styles.loading}>
                    <CircularLoader small />
                    {i18n.t('Loading periods')}
                </div>
            )}
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
