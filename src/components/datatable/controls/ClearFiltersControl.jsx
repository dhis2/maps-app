import i18n from '@dhis2/d2-i18n'
import { IconFilter16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/ClearFiltersControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const ClearFiltersControl = ({ disabled, onClick }) => (
    <ToolbarIconButton
        tooltip={i18n.t('Clear filters')}
        onClick={onClick}
        disabled={disabled}
    >
        <span className={styles.filteredIcon}>
            <IconFilter16 />
            <span className={styles.clearBadge} />
        </span>
    </ToolbarIconButton>
)

ClearFiltersControl.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default ClearFiltersControl
