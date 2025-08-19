import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import {
    LABEL_TEMPLATE_NAME_ONLY,
    LABEL_TEMPLATE_NAME_AND_VALUE,
    LABEL_TEMPLATE_VALUE_ONLY,
} from '../../constants/layers.js'
import SelectField from './SelectField.jsx'

const getLabelDisplayOptions = () => [
    {
        id: LABEL_TEMPLATE_NAME_ONLY,
        name: i18n.t('Name'),
    },
    {
        id: LABEL_TEMPLATE_NAME_AND_VALUE,
        name: i18n.t('Name and value'),
    },
    {
        id: LABEL_TEMPLATE_VALUE_ONLY,
        name: i18n.t('Value'),
    },
]

const LabelDisplayOptions = ({ option, onDisplayOptionChange }) => {
    return (
        <SelectField
            label={i18n.t('Display')}
            loading={false}
            items={getLabelDisplayOptions()}
            value={option || null}
            onChange={({ id }) => onDisplayOptionChange(id)}
        />
    )
}

LabelDisplayOptions.propTypes = {
    onDisplayOptionChange: PropTypes.func.isRequired,
    option: PropTypes.string,
}

export default LabelDisplayOptions
