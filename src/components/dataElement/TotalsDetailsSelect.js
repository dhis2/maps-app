import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { Radio, RadioGroup } from '../core/index.js'

const TotalsDetailsSelect = ({ operand, onChange }) => (
    <RadioGroup
        name="operand"
        value={operand === true ? 'details' : 'totals'}
        onChange={(value) => onChange(value === 'details')}
        display="row"
    >
        <Radio value="totals" label={i18n.t('Totals')} />
        <Radio value="details" label={i18n.t('Details')} />
    </RadioGroup>
)

TotalsDetailsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    operand: PropTypes.bool, // true = 'details'
}

export default TotalsDetailsSelect
