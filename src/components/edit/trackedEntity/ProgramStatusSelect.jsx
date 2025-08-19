import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { getProgramStatuses } from '../../../constants/programStatuses.js'
import { SelectField } from '../../core/index.js'

const ProgramStatusSelect = ({ value = 'ALL', onChange, className }) => (
    <SelectField
        label={i18n.t('Program status')}
        items={getProgramStatuses()}
        value={value}
        onChange={(valueType) => onChange(valueType.id)}
        className={className}
    />
)

ProgramStatusSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    value: PropTypes.string,
}

export default ProgramStatusSelect
