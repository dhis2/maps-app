import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { dimConf } from '../../../constants/dimension.js'
import { SelectField } from '../../core/index.js'

const ValueTypeSelect = (props) => {
    const { value, onChange, className } = props

    // If value type is data element operand, make it data element
    const type =
        value === dimConf.operand.objectName
            ? dimConf.dataElement.objectName
            : value

    // TODO: Avoid creating on each render (needs to be created after i18next contains translations
    const items = [
        { id: dimConf.indicator.objectName, name: i18n.t('Indicator') },
        { id: dimConf.dataElement.objectName, name: i18n.t('Data element') },
        { id: dimConf.dataSet.objectName, name: i18n.t('Reporting rates') },
        {
            id: dimConf.eventDataItem.objectName,
            name: i18n.t('Event data items'),
        },
        {
            id: dimConf.programIndicator.objectName,
            name: i18n.t('Program indicators'),
        },
    ]

    return (
        <SelectField
            label={i18n.t('Item type')}
            items={items}
            value={type}
            onChange={(valueType) => onChange(valueType.id)}
            className={className}
            dataTest="itemtypeselect"
        />
    )
}

ValueTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    value: PropTypes.string,
}

export default ValueTypeSelect
