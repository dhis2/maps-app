import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Drawer.module.css'

const Drawer = ({ position = 'right', className, children }) => (
    <div
        className={cx(className, styles.drawer, {
            [styles.left]: position === 'left',
            [styles.right]: position === 'right',
        })}
    >
        {children}
    </div>
)

Drawer.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    className: PropTypes.string,
    position: PropTypes.string,
}

export default Drawer
