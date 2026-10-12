import i18n from '@dhis2/d2-i18n'
import { Button, Chip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilter } from '../../../actions/dataFilters.js'
import { getFilterSummary } from './filterHelpers.js'
import styles from './styles/Filters.module.css'

const ActiveFiltersBar = ({
    layerId,
    filters,
    headers,
    rowCount,
    totalCount,
}) => {
    const dispatch = useDispatch()
    const keys = Object.keys(filters || {})

    if (!keys.length) {
        return null
    }

    const getColumnName = (key) =>
        headers?.find((h) => h.dataKey === key)?.name ?? key

    return (
        <div className={styles.filtersBar} data-test="data-table-filters-bar">
            <div className={styles.chips}>
                {keys.map((key) => (
                    <Chip
                        key={key}
                        dense
                        onRemove={() => dispatch(clearDataFilter(layerId, key))}
                    >
                        <span className={styles.chipColumn}>
                            {getColumnName(key)}
                        </span>{' '}
                        {getFilterSummary(filters[key])}
                    </Chip>
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
    filters: PropTypes.object,
    headers: PropTypes.array,
}

export default ActiveFiltersBar
