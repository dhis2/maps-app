import React from 'react';
import PropTypes from 'prop-types';
import FilterInput from './FilterInput';
import { SortIndicator } from 'react-virtualized';
import styles from './styles/ColumnHeader.module.css';

// Replacement for https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultHeaderRenderer.js

const ColumnHeader = ({ dataKey, label, type, sortBy, sortDirection }) => (
    <div title={label} className={styles.columnHeader}>
        <span className={styles.label}>{label}</span>
        {sortBy === dataKey ? (
            <SortIndicator sortDirection={sortDirection} />
        ) : null}
        <FilterInput type={type} dataKey={dataKey} />
    </div>
);

ColumnHeader.propTypes = {
    dataKey: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
};

export default ColumnHeader;
