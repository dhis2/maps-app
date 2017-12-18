import React from 'react';
import PropTypes from 'prop-types';
import FilterInput from './FilterInput';
import FilterMultiSelect from './FilterMultiSelect';
import './ColumnHeader.css';
import { SortIndicator } from 'react-virtualized';

// Replacement for https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultHeaderRenderer.js

const ColumnHeader = ({ dataKey, label, type, sortBy, sortDirection }) => (
    <div className='ColumnHeader'>
        <span className='ColumnHeader-label' title={label}>{label}</span>
        {sortBy === dataKey ? <SortIndicator sortDirection={sortDirection} /> : null}
        {type === 'multiselect' ?
            <FilterMultiSelect
                dataKey={dataKey}
            />
        :
            <FilterInput
                type={type}
                dataKey={dataKey}
            />
        }
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
