import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/IconButton.module.css'

const IconButton = ({ tooltip, onClick, className, children, dataTest }) => {
    const icon = <div className={styles.icon}>{children}</div>

    return (
        <div
            onClick={onClick}
            className={cx(styles.iconButton, className)}
            data-test={dataTest}
        >
            {tooltip ? <Tooltip content={tooltip}>{icon}</Tooltip> : icon}
        </div>
    )
}

IconButton.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    dataTest: PropTypes.string,
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
}

export default IconButton
