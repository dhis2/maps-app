import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import {
    Button,
    Tooltip,
    IconChevronLeft24,
    IconChevronRight24,
} from '@dhis2/ui';
import cx from 'classnames';
import { SelectField } from '../core';
import { getFixedPeriodsByType, filterFuturePeriods } from '../../util/periods';
import { getYear } from '../../util/time';
import styles from './styles/PeriodSelect.module.css';

class PeriodSelect extends Component {
    static propTypes = {
        periodType: PropTypes.string,
        period: PropTypes.shape({
            id: PropTypes.string.isRequired,
            startDate: PropTypes.string,
        }),
        periodsSettings: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
    };

    state = {
        year: null,
        periods: null,
    };

    componentDidMount() {
        this.setPeriods();
    }

    componentDidUpdate(prevProps, prevState) {
        const { periodType, period, onChange } = this.props;
        const { year, periods } = this.state;

        if (periodType !== prevProps.periodType) {
            this.setPeriods();
        } else if (periods && !period) {
            onChange(filterFuturePeriods(periods)[0] || periods[0]); // Autoselect most recent period
        }

        // Change period if year is changed (but keep period index)
        if (period && prevState.periods && year !== prevState.year) {
            const periodIndex = prevState.periods.findIndex(
                item => item.id === period.id
            );
            onChange(periods[periodIndex]);
        }
    }

    render() {
        const {
            periodType,
            period,
            onChange,
            className,
            errorText,
        } = this.props;
        const { periods } = this.state;

        if (!periods) {
            return null;
        }

        const value =
            period && periods.some(p => p.id === period.id) ? period.id : null;

        return (
            <div className={cx(styles.periodSelect, className)}>
                <SelectField
                    label={i18n.t('Period')}
                    items={periods}
                    value={value}
                    onChange={onChange}
                    errorText={!value && errorText ? errorText : null}
                    className={styles.select}
                />
                {periodType && (
                    <div className={styles.stepper}>
                        <Tooltip content={i18n.t('Previous year')}>
                            <Button
                                secondary
                                icon={<IconChevronLeft24 />}
                                onClick={this.previousYear}
                            />
                        </Tooltip>
                        <Tooltip content={i18n.t('Next year')}>
                            <Button
                                secondary
                                icon={<IconChevronRight24 />}
                                onClick={this.nextYear}
                            />
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    }

    setPeriods() {
        const { periodType, periodsSettings, period } = this.props;
        const year = this.state.year || getYear(period && period.startDate);
        let periods;

        if (periodType) {
            periods = getFixedPeriodsByType(periodType, year, periodsSettings);
        } else if (period) {
            periods = [period]; // If period is loaded in favorite
        }

        this.setState({ periods, year });
    }

    nextYear = () => {
        this.changeYear(1);
    };

    previousYear = () => {
        this.changeYear(-1);
    };

    changeYear = change => {
        const { periodType, periodsSettings } = this.props;
        const year = this.state.year + change;

        this.setState({
            year,
            periods: getFixedPeriodsByType(periodType, year, periodsSettings),
        });
    };
}

export default PeriodSelect;
