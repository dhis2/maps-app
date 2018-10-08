import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import IconButton from '@material-ui/core/IconButton';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import { filterFuturePeriods } from 'd2/lib/period/helpers';
import { createPeriods } from '../../util/periods';

const styles = theme => ({
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
        periodType: PropTypes.string,
        period: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }),
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
    };

    state = {
        year: new Date().getFullYear(),
        periods: null,
    };

    constructor(props) {
        super(props);
        this.periodIndex = null;
    }

    componentDidMount() {
        this.setPeriods();
    }

    componentDidUpdate(prevProps, prevState) {
        const { periodType, period, onChange } = this.props;
        const { year, periods } = this.state;

        if (periodType !== prevProps.periodType) {
            this.setPeriods();
        } else if (periods && !period) {
            onChange(filterFuturePeriods(periods)[0]); // Autoselect most recent period
        }

        // Change period if year is changed (but keep period index)
        if (period && year !== prevState.year) {
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
            style,
            errorText,
        } = this.props;
        const { periods } = this.state;
        const value = period ? period.id : null;

        if (!periods) {
            return null;
        }

        return (
            <div style={{ height: 100, ...style }}>
                <SelectField
                    label={i18n.t('Period')}
                    items={periods}
                    value={value}
                    onChange={onChange}
                    classes={{
                        textField: classes.select,
                    }}
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
        let periods;

        if (periodType) {
            periods = createPeriods(locale, periodType, this.state.year);
        } else if (period) {
            periods = [period]; // If period is loaded in favorite
        }

        this.setState({ periods });
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

export default connect(state => ({
    locale: state.userSettings.keyUiLocale,
}))(withStyles(styles)(PeriodSelect));
