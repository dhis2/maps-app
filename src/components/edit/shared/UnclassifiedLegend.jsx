import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { NO_DATA_COLOR } from '../../../constants/layers.js'
import OptionalLegendItem from './OptionalLegendItem.jsx'

const UnclassifiedLegend = ({ value, onChange, label }) => (
    <OptionalLegendItem
        value={value}
        onChange={onChange}
        label={label ?? i18n.t('Include unclassified org units')}
        placeholder={i18n.t('Unclassified')}
        defaultColor={NO_DATA_COLOR}
    />
)

UnclassifiedLegend.propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    value: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
}

export default UnclassifiedLegend
