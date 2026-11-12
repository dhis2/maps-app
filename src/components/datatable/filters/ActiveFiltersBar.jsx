import i18n from '@dhis2/d2-i18n'
import { Button, Chip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
    clearDataFilter,
    clearDataFilters,
} from '../../../actions/dataFilters.js'
import { getFilterType } from '../../../util/dataTable.js'
import FilterPopover from './FilterPopover.jsx'
import { getFilterSummary } from './filterSummary.js'
import styles from './styles/Filters.module.css'

// The chip opens its column's filter, so it can be edited even when the
// column is hidden or scrolled out of view
const FilterChip = ({ layerId, header, column, filter }) => {
    const dispatch = useDispatch()
    const anchorRef = useRef()
    const [isOpen, setIsOpen] = useState(false)
    const { name, dataKey } = header

    return (
        <span ref={anchorRef} className={styles.chipAnchor}>
            <Chip
                dense
                onClick={() => setIsOpen(true)}
                onRemove={() => dispatch(clearDataFilter(layerId, dataKey))}
                dataTest={`data-table-filter-chip-${dataKey}`}
            >
                <span className={styles.chipColumn}>{name}</span>{' '}
                {getFilterSummary(filter, column.formatValue)}
            </Chip>
            {isOpen && (
                <FilterPopover
                    anchorRef={anchorRef}
                    layerId={layerId}
                    name={name}
                    dataKey={dataKey}
                    filterType={getFilterType(header)}
                    column={column}
                    filter={filter}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </span>
    )
}

FilterChip.propTypes = {
    column: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    layerId: PropTypes.string.isRequired,
}

const ActiveFiltersBar = ({ layerId, filters, headers, getColumn }) => {
    const dispatch = useDispatch()
    const filtered = headers.filter(({ dataKey }) => filters?.[dataKey])

    if (!filtered.length) {
        return null
    }

    return (
        <div className={styles.filtersBar} data-test="data-table-filters-bar">
            {filtered.map((header) => (
                <FilterChip
                    key={header.dataKey}
                    layerId={layerId}
                    header={header}
                    column={getColumn(header)}
                    filter={filters[header.dataKey]}
                />
            ))}
            <Button
                small
                secondary
                onClick={() => dispatch(clearDataFilters(layerId))}
                dataTest="data-table-filters-clear-all"
            >
                {i18n.t('Clear all')}
            </Button>
        </div>
    )
}

ActiveFiltersBar.propTypes = {
    getColumn: PropTypes.func.isRequired,
    headers: PropTypes.array.isRequired,
    layerId: PropTypes.string.isRequired,
    filters: PropTypes.object,
}

export default ActiveFiltersBar
