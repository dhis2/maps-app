import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Tooltip } from '@dhis2/ui';
import styles from './styles/IconButton.module.css';

const IconButton = ({ tooltip, onClick, className, children, dataTest }) => {
    const icon = <div className={styles.icon}>{children}</div>;

    return (
        <div
            onClick={onClick}
            className={cx(styles.iconButton, className)}
            data-test={dataTest}
        >
            {tooltip ? <Tooltip content={tooltip}>{icon}</Tooltip> : icon}
        </div>
    );
};

IconButton.propTypes = {
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.node,
    dataTest: PropTypes.string,
};

export default IconButton;
