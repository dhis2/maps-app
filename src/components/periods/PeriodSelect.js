import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { createPeriodGeneratorsForLocale } from 'd2/lib/period/generators';

class PeriodSelect extends Component {
    constructor(props, context) {
        super(props, context);
        this.periodGenerator = createPeriodGeneratorsForLocale(props.locale);
    }

    render() {
        const { periodType, period, onChange, style, errorText } = this.props;
        const value = period ? period.id : null;
        let periods;

        if (periodType) {
            const generator =
                this.periodGenerator[`generate${periodType}PeriodsForYear`] ||
                this.periodGenerator[`generate${periodType}PeriodsUpToYear`];
            if (!generator) {
                return null;
            }
            periods = generator().reverse();
        } else {
            if (!period) {
                return null;
            }
            periods = [period]; // If favorite is loaded, we only know the used period
        }

        return (
            <SelectField
                label={i18next.t('Period')}
                items={periods}
                value={value}
                onChange={onChange}
                style={style}
                errorText={!value && errorText ? errorText : null}
            />
        );
    }
}

export default connect(state => ({
    locale: state.userSettings.keyUiLocale,
}))(PeriodSelect);
