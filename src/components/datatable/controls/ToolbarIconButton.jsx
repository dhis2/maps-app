import PropTypes from 'prop-types'
import React, { forwardRef } from 'react'
import IconButton from '../../core/IconButton.jsx'
import styles from './styles/ToolbarIconButton.module.css'

const ToolbarIconButton = forwardRef(
    ({ tooltip, onClick, children, dataTest, disabled, ariaLabel }, ref) => (
        <IconButton
            ref={ref}
            tooltip={tooltip}
            onClick={onClick}
            className={styles.toolbarIconButton}
            dataTest={dataTest}
            disabled={disabled}
            ariaLabel={ariaLabel}
        >
            {children}
        </IconButton>
    )
)

ToolbarIconButton.displayName = 'ToolbarIconButton'

ToolbarIconButton.propTypes = {
    ariaLabel: PropTypes.string,
    children: PropTypes.node,
    dataTest: PropTypes.string,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
}

export default ToolbarIconButton
