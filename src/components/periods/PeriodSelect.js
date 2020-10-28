import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { IconButton } from '@material-ui/core';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import { filterFuturePeriods } from 'd2/period/helpers';
import { createPeriods } from '../../util/periods';
import { getYear } from '../../util/time';

const styles = () => ({
    select: {
        margin: '12px 0',
        width: 'calc(100% - 60px)',
    },
    stepper: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: 34,
        marginLeft: 12,
    },
    button: {
        width: 24,
        height: 24,
        padding: 0,
    },
});

class PeriodSelect extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
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
            classes,
            periodType,
            period,
            onChange,
            className,
            errorText,
        } = this.props;
        const { periods } = this.state;
        const value = period ? period.id : null;

        if (!periods) {
            return null;
        }

        return (
            <div className={className} style={{ height: 100 }}>
                <SelectField
                    label={i18n.t('Period')}
                    items={periods}
                    value={value}
                    onChange={onChange}
                    errorText={!value && errorText ? errorText : null}
                />
                {periodType && (
                    <div className={classes.stepper}>
                        <IconButton
                            tooltip={i18n.t('Previous year')}
                            onClick={this.previousYear}
                            className={classes.button}
                            disableTouchRipple={true}
                        >
                            <LeftIcon />
                        </IconButton>
                        <IconButton
                            tooltip={i18n.t('Next year')}
                            onClick={this.nextYear}
                            className={classes.button}
                            disableTouchRipple={true}
                        >
                            <RightIcon />
                        </IconButton>
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
}))(withStyles(styles)(PeriodSelect));
