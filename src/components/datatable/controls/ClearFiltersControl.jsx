import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { FilterActiveIcon } from '../../core/index.js'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const ClearFiltersControl = ({ disabled, onClick }) => (
    <ToolbarIconButton
        tooltip={i18n.t('Clear filters')}
        ariaLabel={i18n.t('Clear filters')}
        dataTest="data-table-clear-filters-button"
        onClick={onClick}
        disabled={disabled}
    >
        <FilterActiveIcon />
    </ToolbarIconButton>
)

ClearFiltersControl.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default ClearFiltersControl
