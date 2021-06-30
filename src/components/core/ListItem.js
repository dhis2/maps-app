import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/ListItem.module.css';

// TODO: Support multiline labels
const ListItem = ({ label, formatter, children }) =>
    children !== null && children !== undefined && children !== '' ? (
        <div className={styles.listItem}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>
                {formatter ? formatter(children) : children}
            </span>
        </div>
    ) : null;

ListItem.propTypes = {
    label: PropTypes.string.isRequired,
    formatter: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

export default ListItem;
