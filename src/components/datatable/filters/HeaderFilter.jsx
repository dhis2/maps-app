import i18n from '@dhis2/d2-i18n'
import { IconFilter16 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { FILTER_ORG_UNIT } from '../useTableData.js'
import FilterPopover from './FilterPopover.jsx'
import styles from './styles/Filters.module.css'

const HeaderFilter = ({ layerId, header, filter, data }) => {
    const anchorRef = useRef()
    const [isOpen, setIsOpen] = useState(false)
    const { name, dataKey, filterType } = header
    const isActive = !!filter

    if (filterType === FILTER_ORG_UNIT) {
        return (
            <button
                className={styles.filterButton}
                disabled
                title={i18n.t(
                    'Filtering by org unit will be available with org unit search'
                )}
                aria-label={i18n.t('Filter {{column}}', { column: name })}
            >
                <IconFilter16 />
            </button>
        )
    }

    return (
        <>
            <button
                ref={anchorRef}
                className={cx(styles.filterButton, {
                    [styles.filterButtonActive]: isActive,
                    [styles.filterButtonOpen]: isOpen,
                })}
                onClick={(event) => {
                    event.stopPropagation()
                    setIsOpen(true)
                }}
                aria-label={i18n.t('Filter {{column}}', { column: name })}
                aria-pressed={isActive}
                title={
                    isActive
                        ? i18n.t('Edit filter')
                        : i18n.t('Filter {{column}}', { column: name })
                }
                data-test={`data-table-filter-button-${dataKey}`}
            >
                <IconFilter16 />
            </button>
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
        </>
    )
}

HeaderFilter.propTypes = {
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        filterType: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    layerId: PropTypes.string.isRequired,
    data: PropTypes.array,
    filter: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
}

export default HeaderFilter
