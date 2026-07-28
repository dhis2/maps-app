import i18n from '@dhis2/d2-i18n'
import { DataTableColumnHeader, DataTableCell, IconSync16 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { SENTINEL_SELECTED_ROW } from '../../constants/dataTable.js'
import { SortIcon } from '../core/icons.jsx'
import styles from './styles/DataTable.module.css'
import TopTooltip from './TopTooltip.jsx'

// Shared between DataTable.jsx and CombinedDataTable.jsx - the checkbox
// column's markup and select-all/reverse-selection/sort-by-selected
// interactions are identical, only where the selection itself lives differs.
export const SelectionCheckboxHeaderCell = ({
    fixed,
    left,
    isAllSelected,
    onToggleSelectAll,
    onReverseSelection,
    disabled,
    sortField,
    sortDirection,
    onSortBySelected,
    filter,
    showFilter,
    onFilterIconClick,
}) => (
    <DataTableColumnHeader
        className={styles.checkboxCell}
        width="76px"
        fixed={fixed}
        left={left}
        onFilterIconClick={onFilterIconClick}
        showFilter={showFilter}
        filter={filter}
    >
        <div className={styles.checkboxHeaderContent}>
            <TopTooltip content={i18n.t('Select all visible rows')}>
                <input
                    type="checkbox"
                    aria-label={i18n.t('Select all visible rows')}
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                />
            </TopTooltip>
            <TopTooltip content={i18n.t('Reverse selection of visible rows')}>
                <button
                    type="button"
                    className={styles.reverseButton}
                    data-test="data-table-reverse-selection"
                    disabled={disabled}
                    onClick={onReverseSelection}
                >
                    <IconSync16 />
                </button>
            </TopTooltip>
            {onSortBySelected && (
                <TopTooltip content={i18n.t('Sort by Selected')}>
                    <button
                        type="button"
                        className={styles.sortButton}
                        data-test="data-table-column-sort-button-selected"
                        onClick={onSortBySelected}
                    >
                        <SortIcon
                            direction={
                                sortField === SENTINEL_SELECTED_ROW
                                    ? sortDirection
                                    : null
                            }
                        />
                    </button>
                </TopTooltip>
            )}
        </div>
    </DataTableColumnHeader>
)

SelectionCheckboxHeaderCell.propTypes = {
    disabled: PropTypes.bool,
    filter: PropTypes.node,
    fixed: PropTypes.bool,
    isAllSelected: PropTypes.bool,
    left: PropTypes.string,
    showFilter: PropTypes.bool,
    sortDirection: PropTypes.string,
    sortField: PropTypes.string,
    onFilterIconClick: PropTypes.func,
    onReverseSelection: PropTypes.func,
    onSortBySelected: PropTypes.func,
    onToggleSelectAll: PropTypes.func,
}

export const SelectionCheckboxCell = ({
    fixed,
    left,
    width,
    className,
    isSelected,
    isHovered,
    onToggle,
}) => (
    <DataTableCell
        staticStyle
        fixed={fixed}
        left={left}
        width={width}
        className={cx(
            styles.checkboxCell,
            { [styles.selected]: isSelected, [styles.hovered]: isHovered },
            className
        )}
    >
        <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
        />
    </DataTableCell>
)

SelectionCheckboxCell.propTypes = {
    className: PropTypes.string,
    fixed: PropTypes.bool,
    isHovered: PropTypes.bool,
    isSelected: PropTypes.bool,
    left: PropTypes.string,
    width: PropTypes.string,
    onToggle: PropTypes.func,
}
