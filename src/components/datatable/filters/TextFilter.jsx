import i18n from '@dhis2/d2-i18n'
import { InputField } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

const TextFilter = ({ draft, onChange }) => (
    <InputField
        dense
        autoFocus
        label={i18n.t('Contains')}
        placeholder={i18n.t('Type to filter')}
        value={draft?.value ?? ''}
        onChange={({ value }) => onChange({ type: 'text', value })}
        dataTest="filter-text-input"
    />
)

TextFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default TextFilter
