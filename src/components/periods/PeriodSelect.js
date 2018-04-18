import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { filterFuturePeriods } from 'd2/lib/period/helpers';
import { createPeriods } from '../../util/periods';

const styles = {
    select: {
        width: 'calc(100% - 60px)',
    },
    stepper: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: 40,
        marginLeft: 12,
    },
    button: {
        backgroundColor: '#eee',
        width: 24,
        height: 24,
        padding: 0,
    },
};

class PeriodSelect extends Component {
    state = {
        year: new Date().getFullYear(),
    };

    constructor(props, context) {
        super(props, context);
        this.nextYear = this.nextYear.bind(this);
        this.previousYear = this.previousYear.bind(this);
    }

    componentDidMount() {
        const { periodType, period, onChange } = this.props;
        const periods = this.generatePeriods(
            periodType,
            this.state.year,
            period
        );

        if (!period && periods) {
            const lastPeriod = filterFuturePeriods(periods)[0]; // Select most recent period
            onChange(lastPeriod);
        }
    }

    // TODO: Refactor
    // If the same period type is selected a second time, the period field is cleared
    componentDidUpdate(prevProps, prevState) {
        const { periodType, period, onChange } = this.props;
        const { year } = this.state;
        const periodHasChanged =
            periodType !== prevProps.periodType || year !== prevState.year;
        let periodIndex = 0;

        if (periodHasChanged) {
            if (year !== prevState.year) {
                // Find previous period index
                periodIndex = this.generatePeriods(
                    prevProps.periodType,
                    prevState.year,
                    prevProps.period
                ).findIndex(item => item.id === prevProps.period.id);
            }

            const periods = this.generatePeriods(
                periodType,
                this.state.year,
                period
            );

            onChange(periods[periodIndex]);
        }
    }

    generatePeriods(periodType, year, period) {
        let periods;

        if (periodType) {
            periods = createPeriods(this.props.locale, periodType, year);
        } else {
            if (!period) {
                return null;
            }
            periods = [period]; // If favorite is loaded, we only know the used period
        }

        this.setState({ periods });

        return periods;
    }

    nextYear() {
        this.setState({ year: this.state.year + 1 });
    }

    previousYear() {
        this.setState({ year: this.state.year - 1 });
    }

    render() {
        const { periodType, period, onChange, style, errorText } = this.props;
        const { periods } = this.state;
        const value = period ? period.id : null;

        return (
            <div style={{ height: 100, ...style }}>
                <SelectField
                    label={i18next.t('Period')}
                    items={periods}
                    value={value}
                    onChange={onChange}
                    style={styles.select}
                    errorText={!value && errorText ? errorText : null}
                />
                <div style={styles.stepper}>
                    <IconButton
                        tooltip={i18next.t('Previous year')}
                        onClick={this.previousYear}
                        style={styles.button}
                        disableTouchRipple={true}
                    >
                        <SvgIcon icon="ChevronLeft" />
                    </IconButton>
                    <IconButton
                        tooltip={i18next.t('Next year')}
                        onClick={this.nextYear}
                        style={styles.button}
                        disableTouchRipple={true}
                    >
                        <SvgIcon icon="ChevronRight" />
                    </IconButton>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    locale: state.userSettings.keyUiLocale,
}))(PeriodSelect);
