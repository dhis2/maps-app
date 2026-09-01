import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { forwardRef } from 'react'
import IconButton from '../../core/IconButton.jsx'
import styles from './styles/ToolbarIconButton.module.css'

const ToolbarIconButton = forwardRef(
    (
        { tooltip, onClick, children, dataTest, disabled, ariaLabel, active },
        ref
    ) => (
        <IconButton
            ref={ref}
            tooltip={tooltip}
            onClick={onClick}
            className={cx(styles.toolbarIconButton, {
                [styles.active]: active,
            })}
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
    active: PropTypes.bool,
    ariaLabel: PropTypes.string,
    children: PropTypes.node,
    dataTest: PropTypes.string,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
}

export default ToolbarIconButton
