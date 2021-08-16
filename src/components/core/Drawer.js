import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './styles/Drawer.module.css';

export const Drawer = ({ position = 'right', className, children }) => (
    <div
        className={cx(className, styles.drawer, {
            [styles.left]: position === 'left',
            [styles.right]: position === 'right',
        })}
    >
        {children}
    </div>
);

Drawer.propTypes = {
    position: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

export default Drawer;
