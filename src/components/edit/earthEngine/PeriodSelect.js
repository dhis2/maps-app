import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import styles from './styles/PeriodSelect.module.css';

const PeriodSelect = ({
    periodType,
    period,
    periods,
    onChange,
    errorText,
    className,
}) => {
    const [year, setYear] = useState();
    const byYear = periodType === 'date';

    const years = useMemo(
        () =>
            byYear && periods
                ? [...new Set(periods.map(p => p.year))].map(year => ({
                      id: year,
                      name: String(year),
                  }))
                : null,
        [byYear, periods]
    );

    const byYearPeriods = useMemo(
        () =>
            byYear && year && periods
                ? periods.filter(p => p.year === year)
                : null,
        [byYear, year, periods]
    );

    const onYearChange = useCallback(
        ({ id }) => {
            onChange(null);
            setYear(id);
        },
        [onChange]
    );

    useEffect(() => {
        if (byYear) {
            if (period) {
                setYear(period.year);
            } else if (years) {
                setYear(years[0].id);
            }
        }
    }, [byYear, period, years]);

    const items = byYear ? byYearPeriods : periods;

    // TODO: loading indicator
    if (!items) {
        return null;
    }

    return (
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
                errorText={!period && errorText ? errorText : null}
                className={styles.period}
            />
        </div>
    );
};

PeriodSelect.propTypes = {
    periodType: PropTypes.string.isRequired,
    period: PropTypes.object,
    periods: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    onChange: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    className: PropTypes.string,
};

export default PeriodSelect;
