import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

const ITEM_NONE = { id: 'none', name: i18n.t('None') }

const DataItemSelect = ({ label, value, dataItems, className, onChange }) => {
    const onDataItemChanged = (item) => {
        onChange(item.id !== ITEM_NONE.id ? item : null)
    }

    return (
        <SelectField
            label={label || i18n.t('Data item')}
            items={dataItems}
            value={value}
            onChange={onDataItemChanged}
            className={className}
        />
    )
}

DataItemSelect.propTypes = {
    className: PropTypes.string,
    dataItems: PropTypes.array,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
}

export default DataItemSelect
