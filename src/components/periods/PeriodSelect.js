import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Tooltip,
    IconChevronLeft24,
    IconChevronRight24,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'
import usePrevious from '../../hooks/usePrevious.js'
import {
    getFixedPeriodsByType,
    filterFuturePeriods,
} from '../../util/periods.js'
import { getYear } from '../../util/time.js'
import { SelectField } from '../core/index.js'
import styles from './styles/PeriodSelect.module.css'

const PeriodSelect = ({
    onChange,
    className,
    errorText,
    firstDate,
    lastDate,
    period,
    periodType,
}) => {
    const [year, setYear] = useState()
    const [periods, setPeriods] = useState()
    const prevPeriods = usePrevious(periods)

    // Increment/decrement year
    const changeYear = useCallback(
        (change) => {
            const newYear = year + change

            if (
                (!firstDate || newYear >= getYear(firstDate)) &&
                (!lastDate || newYear <= getYear(lastDate))
            ) {
                setYear(newYear)
            }
        },
        [year, firstDate, lastDate]
    )

    // Set initial year
    useEffect(() => {
        if (!year) {
            setYear(getYear(period?.startDate || lastDate))
        }
    }, [year, period, lastDate])

    // Set periods when year changes
    useEffect(() => {
        if (year && periodType) {
            setPeriods(
                getFixedPeriodsByType(periodType, year, firstDate, lastDate)
            )
        }
    }, [year, periodType, firstDate, lastDate])

    // If period is loaded in favorite
    useEffect(() => {
        if (!periodType && !periods && period) {
            setPeriods([period])
        }
    }, [periodType, period, periods])

    useEffect(() => {
        if (periods) {
            if (!period) {
                // Autoselect most recent period
                onChange(filterFuturePeriods(periods)[0] || periods[0])
            } else if (
                !periods.find((p) => p.id === period.id) &&
                prevPeriods
            ) {
                // Change period if year is changed (but keep period index)
                const periodIndex = prevPeriods.findIndex(
                    (p) => p.id === period.id
                )

                if (periodIndex !== -1) {
                    onChange(periods[periodIndex])
                }
            }
        }
    }, [period, periods, prevPeriods, onChange])

    if (!periods) {
        return null
    }

    const value =
        period && periods.some((p) => p.id === period.id) ? period.id : null

    return (
        <div className={cx(styles.periodSelect, className)}>
            <SelectField
                label={i18n.t('Period')}
                items={periods}
                value={value}
                onChange={onChange}
                errorText={!value && errorText ? errorText : null}
                className={styles.select}
                dataTest="year-select"
            />
            {periodType && (
                <div className={styles.stepper}>
                    <Tooltip content={i18n.t('Previous year')}>
                        <Button
                            secondary
                            icon={<IconChevronLeft24 />}
                            onClick={() => changeYear(-1)}
                            dataTest="button-previous-year"
                        />
                    </Tooltip>
                    <Tooltip content={i18n.t('Next year')}>
                        <Button
                            secondary
                            icon={<IconChevronRight24 />}
                            onClick={() => changeYear(1)}
                            dataTest="button-next-year"
                        />
                    </Tooltip>
                </div>
            )}
        </div>
    )
}

PeriodSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    firstDate: PropTypes.string,
    lastDate: PropTypes.string,
    period: PropTypes.shape({
        id: PropTypes.string.isRequired,
        startDate: PropTypes.string,
    }),
    periodType: PropTypes.string,
}

export default PeriodSelect
