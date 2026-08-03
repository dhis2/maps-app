import i18n from '@dhis2/d2-i18n'
import { range } from 'lodash/fp'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

const DECIMAL_PLACES_AUTO = 'auto'

const decimalPlacesItems = [
    { id: DECIMAL_PLACES_AUTO, name: i18n.t('Auto') },
    ...range(0, 7).map((num) => ({ id: num, name: num.toString() })),
]

const DecimalPlacesSelect = ({ value, onChange, className }) => (
    <SelectField
        label={i18n.t('Decimal places')}
        value={value ?? DECIMAL_PLACES_AUTO}
        items={decimalPlacesItems}
        onChange={(item) =>
            onChange(item.id === DECIMAL_PLACES_AUTO ? undefined : item.id)
        }
        className={className}
    />
)

DecimalPlacesSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    value: PropTypes.number,
}

export default DecimalPlacesSelect
