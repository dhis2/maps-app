import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

const OptionSetSelect = ({ options, value, onChange, className }) => {
    // TODO: Temporarily fix until we have a searchable SelectField handling hundreds of options
    if (options.length > 100) {
        options = options.slice(0, 100)
    }

    return (
        <SelectField
            label={i18n.t('Options')}
            items={options.map((option) => ({
                id: option.code,
                name: option.name,
            }))}
            value={value}
            multiple={true}
            onChange={onChange}
            className={className}
        />
    )
}

OptionSetSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.array,
}

export default OptionSetSelect
