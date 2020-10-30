import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Button, Tooltip } from '@dhis2/ui';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import cx from 'classnames';
import { filterFuturePeriods } from 'd2/period/helpers';
import SelectField from '../core/SelectField';
import { createPeriods } from '../../util/periods';
import { getYear } from '../../util/time';
import styles from './styles/PeriodSelect.module.css';

class PeriodSelect extends Component {
    static propTypes = {
        locale: PropTypes.string,
        periodType: PropTypes.string,
        period: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            startDate: PropTypes.string,
        }),
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
                                icon={<LeftIcon />}
                                onClick={this.previousYear}
                            />
                        </Tooltip>
                        <Tooltip content={i18n.t('Next year')}>
                            <Button
                                secondary
                                icon={<RightIcon />}
                                onClick={this.nextYear}
                            />
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    }

    setPeriods() {
        const { periodType, period, locale } = this.props;
        const year = this.state.year || getYear(period && period.startDate);
        let periods;

        if (periodType) {
            periods = createPeriods(locale, periodType, year);
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
        const { locale, periodType } = this.props;
        const year = this.state.year + change;

        this.setState({
            year,
            periods: createPeriods(locale, periodType, year),
        });
    };
}

export default connect(({ settings }) => ({
    locale: settings.user.keyUiLocale,
}))(PeriodSelect);
