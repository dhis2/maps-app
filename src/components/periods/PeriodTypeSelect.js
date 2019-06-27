import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { periodTypes, relativePeriods } from '../../constants/periods';

let periods;

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

        if (!value && period) {
            if (relativePeriods.find(p => p.id === period.id)) {
                onChange(
                    { id: 'relativePeriods', name: i18n.t('Relative') },
                    false
                );
            }
        }
    }

    render() {
        const { value, onChange, style, errorText } = this.props;

        if (!periods) {
            // Translate period names
            periods = periodTypes.map(({ id, name }) => ({
                id,
                name: i18n.t(name),
            }));
        }

        return (
            <SelectField
                label={i18n.t('Period type')}
                items={periods}
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
