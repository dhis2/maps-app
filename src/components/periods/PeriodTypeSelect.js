import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { getPeriodTypes, getRelativePeriods } from '../../constants/periods';

class PeriodTypeSelect extends Component {
    static propTypes = {
        value: PropTypes.string,
        period: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
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
        const { value, onChange, style, errorText } = this.props;

        return (
            <SelectField
                label={i18n.t('Period type')}
                items={getPeriodTypes()}
                value={value}
                onChange={onChange}
                style={style}
                errorText={!value && errorText ? errorText : null}
                data-test="periodtypeselect"
            />
        );
    }
}

export default PeriodTypeSelect;
