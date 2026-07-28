import i18n from '@dhis2/d2-i18n'
import { DataTableColumnHeader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { SortIcon } from '../core/icons.jsx'
import styles from './styles/DataTable.module.css'
import TopTooltip from './TopTooltip.jsx'

// Shared between DataTable.jsx and CombinedDataTable.jsx - both produce the
// same {name, dataKey} header shape and the same sort-button interaction,
// so only the surrounding column-header props (pinning, filter) differ.
const SortableColumnHeader = ({
    name,
    dataKey,
    sortField,
    sortDirection,
    onSort,
    dataTestPrefix,
    ...columnHeaderProps
}) => (
    <DataTableColumnHeader name={dataKey} {...columnHeaderProps}>
        <span className={styles.headerContent}>
            <span className={styles.headerTitle}>{name}</span>
            <TopTooltip
                content={i18n.t('Sort by {{column}}', { column: name })}
            >
                <button
                    type="button"
                    className={styles.sortButton}
                    data-test={`${dataTestPrefix}-${name}`}
                    onClick={() => onSort({ name: dataKey })}
                >
                    <SortIcon
                        direction={dataKey === sortField ? sortDirection : null}
                    />
                </button>
            </TopTooltip>
        </span>
    </DataTableColumnHeader>
)

SortableColumnHeader.propTypes = {
    dataKey: PropTypes.string.isRequired,
    dataTestPrefix: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onSort: PropTypes.func.isRequired,
    sortDirection: PropTypes.string,
    sortField: PropTypes.string,
}

export default SortableColumnHeader
