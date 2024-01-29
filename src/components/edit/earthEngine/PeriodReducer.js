import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPeriodReducer } from '../../../actions/layerEdit.js'
import { START_END_DATES } from '../../../constants/periods.js'
import { getTimeRange, createTimeRange } from '../../../util/earthEngine.js'
import { SelectField } from '../../core/index.js'
import PeriodSelect from '../../periods/PeriodSelect.js'
import PeriodTypeSelect from '../../periods/PeriodTypeSelect.js'
import StartEndDates from './StartEndDates.js'
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
    defaultPeriodType,
    range,
    // reducer,
    onChange,
    errorText,
    className,
}) => {
    const [periodType, setPeriodType] = useState(defaultPeriodType)
    const [dateRange, setDateRange] = useState()
    const reducer = useSelector((state) => state.layerEdit.periodReducer)
    const dispatch = useDispatch()

    const onPeriodChange = useCallback(
        (period) => onChange(period ? { ...period, periodType } : null),
        [periodType, onChange]
    )

    const onPeriodReducerChange = useCallback(
        (reducer) => {
            dispatch(setPeriodReducer(reducer.id))
        },
        [dispatch]
    )

    useEffect(() => {
        if (range) {
            setDateRange(createTimeRange(range))
        } else {
            getTimeRange(datasetId).then(setDateRange)
        }
    }, [datasetId, range])

    // Clear period when periodType is changed
    useEffect(() => {
        onChange()
    }, [periodType, onChange])

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
                        <StartEndDates
                            periodType={periodType}
                            dateRange={dateRange}
                            period={period}
                            // startDate={dateRange.firstDate}
                            // endDate={dateRange.lastDate}
                            onChange={onPeriodChange}
                            className={styles.periodSelect}
                            // errorText={errorText}
                        />
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
                            onChange={onPeriodReducerChange}
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
    datasetId: PropTypes.string.isRequired,
    defaultPeriodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.object,
    range: PropTypes.shape({
        firstDate: PropTypes.string.isRequired,
        lastDate: PropTypes.number.isRequired, // relative to today
    }),
}

export default EarthEnginePeriodReducer
