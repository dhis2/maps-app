import i18n from '@dhis2/d2-i18n'
import { Button, Chip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilter } from '../../../actions/dataFilters.js'
import FilterPopover from './FilterPopover.jsx'
import { getFilterSummary } from './filterHelpers.js'
import styles from './styles/Filters.module.css'

// Clicking the chip reopens the column's filter, anchored to the chip so it
// works even when the column is scrolled out of view or hidden
const FilterChip = ({ layerId, dataKey, header, filter, data }) => {
    const dispatch = useDispatch()
    const anchorRef = useRef()
    const [isOpen, setIsOpen] = useState(false)
    const isEditable = !!header?.filterType && typeof filter === 'object'

    return (
        <span
            ref={anchorRef}
            className={styles.chipAnchor}
            title={isEditable ? i18n.t('Edit filter') : undefined}
        >
            <Chip
                dense
                onClick={isEditable ? () => setIsOpen(true) : undefined}
                onRemove={() => dispatch(clearDataFilter(layerId, dataKey))}
                dataTest={`data-table-filter-chip-${dataKey}`}
            >
                <span className={styles.chipColumn}>
                    {header?.name ?? dataKey}
                </span>{' '}
                {getFilterSummary(filter)}
            </Chip>
            {isOpen && (
                <FilterPopover
                    anchorRef={anchorRef}
                    layerId={layerId}
                    header={header}
                    filter={filter}
                    data={data}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </span>
    )
}

FilterChip.propTypes = {
    dataKey: PropTypes.string.isRequired,
    filter: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
        .isRequired,
    layerId: PropTypes.string.isRequired,
    data: PropTypes.array,
    header: PropTypes.object,
}

const ActiveFiltersBar = ({
    layerId,
    filters,
    headers,
    data,
    rowCount,
    totalCount,
}) => {
    const dispatch = useDispatch()
    const keys = Object.keys(filters || {})

    if (!keys.length) {
        return null
    }

    return (
        <div className={styles.filtersBar} data-test="data-table-filters-bar">
            <div className={styles.chips}>
                {keys.map((key) => (
                    <FilterChip
                        key={key}
                        layerId={layerId}
                        dataKey={key}
                        header={headers?.find((h) => h.dataKey === key)}
                        filter={filters[key]}
                        data={data}
                    />
                ))}
                <Button
                    small
                    secondary
                    onClick={() =>
                        keys.forEach((key) =>
                            dispatch(clearDataFilter(layerId, key))
                        )
                    }
                    dataTest="data-table-clear-filters"
                >
                    {i18n.t('Clear all')}
                </Button>
            </div>
            <span className={styles.rowCount}>
                {i18n.t('{{rowCount}} of {{totalCount}} rows', {
                    rowCount,
                    totalCount,
                })}
            </span>
        </div>
    )
}

ActiveFiltersBar.propTypes = {
    layerId: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    data: PropTypes.array,
    filters: PropTypes.object,
    headers: PropTypes.array,
}

export default ActiveFiltersBar
