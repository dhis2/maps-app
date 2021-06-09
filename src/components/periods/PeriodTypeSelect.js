import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { getPeriodTypes, getRelativePeriods } from '../../util/periods';

class PeriodTypeSelect extends Component {
    static propTypes = {
        value: PropTypes.string,
        period: PropTypes.object,
        hiddenPeriods: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
    };

    componentDidMount() {
        const { value, period, onChange } = this.props;
        const relativePeriodType = {
            id: 'relativePeriods',
            name: i18n.t('Relative'),
        };

        if (!value && period) {
            if (getRelativePeriods().find(p => p.id === period.id)) {
                // false will not clear the period dropdown
                onChange(relativePeriodType, false);
            }
        } else if (!value) {
            // set relativePeriods as default
            onChange(relativePeriodType);
        }
    }

    render() {
        const {
            value,
            hiddenPeriods,
            onChange,
            className,
            errorText,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Period type')}
                items={getPeriodTypes(hiddenPeriods)}
                value={value}
                onChange={onChange}
                className={className}
                errorText={!value && errorText ? errorText : null}
                dataTest="periodtypeselect"
            />
        );
    }
}

export default connect(({ settings }) => ({
    hiddenPeriods: settings.hiddenPeriods,
}))(PeriodTypeSelect);
