import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { NO_DATA_COLOR } from '../../../constants/layers.js'
import OptionalLegendItem from './OptionalLegendItem.jsx'

const NoDataLegend = ({ value, onChange, label }) => (
    <OptionalLegendItem
        value={value}
        onChange={onChange}
        label={label ?? i18n.t('Include org units with no data')}
        placeholder={i18n.t('No data')}
        defaultColor={NO_DATA_COLOR}
    />
)

NoDataLegend.propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    value: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
}

export default NoDataLegend
