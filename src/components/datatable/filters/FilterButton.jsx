import i18n from '@dhis2/d2-i18n'
import { IconFilter16 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import TopTooltip from '../TopTooltip.jsx'
import FilterPopover from './FilterPopover.jsx'
import styles from './styles/Filters.module.css'

const FilterButton = ({ layerId, name, dataKey, filterType, filter }) => {
    const anchorRef = useRef()
    const [isOpen, setIsOpen] = useState(false)
    const label = i18n.t('Filter by {{column}}', { column: name })

    return (
        <>
            <TopTooltip content={label}>
                <button
                    ref={anchorRef}
                    type="button"
                    className={cx(styles.filterButton, {
                        [styles.filterButtonActive]: !!filter,
                        [styles.filterButtonOpen]: isOpen,
                    })}
                    aria-label={label}
                    aria-pressed={!!filter}
                    onClick={() => setIsOpen(true)}
                    data-test={`data-table-filter-button-${dataKey}`}
                >
                    <IconFilter16 />
                </button>
            </TopTooltip>
            {isOpen && (
                <FilterPopover
                    anchorRef={anchorRef}
                    layerId={layerId}
                    name={name}
                    dataKey={dataKey}
                    filterType={filterType}
                    filter={filter}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    )
}

FilterButton.propTypes = {
    dataKey: PropTypes.string.isRequired,
    filterType: PropTypes.string.isRequired,
    layerId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    filter: PropTypes.object,
}

export default FilterButton
