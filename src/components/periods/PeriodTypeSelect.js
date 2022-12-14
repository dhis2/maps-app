import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { RELATIVE_PERIODS } from '../../constants/periods.js'
import { getPeriodTypes, getRelativePeriods } from '../../util/periods.js'
import { SelectField } from '../core/index.js'

class PeriodTypeSelect extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
        hiddenPeriods: PropTypes.array,
        period: PropTypes.object,
        value: PropTypes.string,
    }

    componentDidMount() {
        const { value, period, onChange } = this.props
        const relativePeriodType = {
            id: RELATIVE_PERIODS,
            name: i18n.t('Relative'),
        }

        if (!value && period) {
            if (getRelativePeriods().find((p) => p.id === period.id)) {
                // false will not clear the period dropdown
                onChange(relativePeriodType, false)
            }
        } else if (!value) {
            // set relativePeriods as default
            onChange(relativePeriodType)
        }
    }

    render() {
        const { value, hiddenPeriods, onChange, className, errorText } =
            this.props

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
        )
    }
}

export default PeriodTypeSelect
