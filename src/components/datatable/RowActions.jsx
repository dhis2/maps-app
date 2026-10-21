import i18n from '@dhis2/d2-i18n'
import { IconInfo16, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/RowActions.module.css'

// @dhis2/ui has no zoom icon, so this follows its 16px stroke style
const IconZoomTo16 = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
    >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14M7 5v4M5 7h4" />
    </svg>
)

const RowAction = ({ label, disabledLabel, onClick, children, dataTest }) => (
    <Tooltip content={onClick ? label : disabledLabel} placement="top">
        <button
            className={styles.action}
            onClick={onClick}
            disabled={!onClick}
            aria-label={label}
            data-test={dataTest}
        >
            {children}
        </button>
    </Tooltip>
)

RowAction.propTypes = {
    children: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    dataTest: PropTypes.string,
    disabledLabel: PropTypes.string,
    onClick: PropTypes.func,
}

// Last cell of every row. A missing handler renders the action disabled.
const RowActions = ({ onOpenProfile, onZoomTo }) => (
    <div className={styles.actions}>
        <RowAction
            label={i18n.t('View profile')}
            disabledLabel={i18n.t('No profile for this feature')}
            onClick={onOpenProfile}
            dataTest="data-table-row-profile"
        >
            <IconInfo16 />
        </RowAction>
        <RowAction
            label={i18n.t('Zoom to feature')}
            onClick={onZoomTo}
            dataTest="data-table-row-zoom"
        >
            <IconZoomTo16 />
        </RowAction>
    </div>
)

RowActions.propTypes = {
    onOpenProfile: PropTypes.func,
    onZoomTo: PropTypes.func,
}

export default RowActions
