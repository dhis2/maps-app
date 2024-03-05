import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/IconButton.module.css'

const IconButton = ({
    tooltip,
    onClick,
    className,
    children,
    dataTest,
    disabled,
    ariaLabel,
}) => {
    return (
        <button
            onClick={onClick}
            className={cx(styles.iconButton, className, {
                [styles.disabled]: !!disabled,
            })}
            data-test={dataTest}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {tooltip ? (
                <Tooltip content={tooltip}>{children}</Tooltip>
            ) : (
                children
            )}
        </button>
    )
}

IconButton.propTypes = {
    ariaLabel: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    dataTest: PropTypes.string,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
}

export default IconButton
