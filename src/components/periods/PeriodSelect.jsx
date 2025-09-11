import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Tooltip,
    IconChevronLeft24,
    IconChevronRight24,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
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
    periodsSettings,
}) => {
    const [year, setYear] = useState(getYear(period?.startDate || lastDate))
    const prevYear = usePrevious(year)

    // Set periods when periodType or year changes
    /* eslint-disable react-hooks/exhaustive-deps */
    const periods = useMemo(
        () =>
            periodType
                ? getFixedPeriodsByType({
                      periodType,
                      year,
                      firstDate,
                      lastDate,
                      periodsSettings,
                  })
                : [period], // saved map period (not included in dependency array by design)
        [periodType, year, firstDate, lastDate, periodsSettings]
    )
    /* eslint-enable react-hooks/exhaustive-deps */

    const periodIndex = useMemo(
        () => period && periods.findIndex((p) => p.id === period.id),
        [period, periods]
    )

    const prevPeriodIndex = usePrevious(periodIndex)

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

    // Autoselect most recent period
    useEffect(() => {
        if (!period && periods) {
            onChange(filterFuturePeriods(periods)[0] || periods[0])
        }
    }, [period, periods, onChange])

    // Keep the same period position when year changes
    useEffect(() => {
        if (year !== prevYear && prevPeriodIndex >= 0) {
            const newPeriod = periods[prevPeriodIndex]

            if (newPeriod) {
                onChange(newPeriod)
            }
        }
    }, [year, prevYear, periods, prevPeriodIndex, onChange])

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
    periodsSettings: PropTypes.object,
}

export default PeriodSelect
