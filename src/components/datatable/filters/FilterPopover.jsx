import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16, Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilter, setDataFilter } from '../../../actions/dataFilters.js'
import {
    getFilterError,
    isEmptyFilter,
    isSameFilter,
    normalizeFilter,
    updateNoValueForCondition,
} from '../../../util/filter.js'
import ConditionRow from './ConditionRow.jsx'
import { getOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

const getEmptyFilter = (filterType) => ({
    type: filterType,
    operator: getOperators(filterType)[0]?.value,
    value: '',
    excluded: [],
})

const FilterPopover = ({
    anchorRef,
    layerId,
    name,
    dataKey,
    filterType,
    filter,
    onClose,
}) => {
    const dispatch = useDispatch()
    const [draft, setDraft] = useState(() => ({
        ...getEmptyFilter(filterType),
        ...filter,
    }))
    const canApply = !isSameFilter(draft, filter) && !getFilterError(draft)

    const updateCondition = (changes) =>
        setDraft((previous) =>
            updateNoValueForCondition(previous, { ...previous, ...changes })
        )

    const apply = (event) => {
        event.preventDefault()
        if (!canApply) {
            return
        }
        dispatch(
            isEmptyFilter(draft)
                ? clearDataFilter(layerId, dataKey)
                : setDataFilter(layerId, dataKey, normalizeFilter(draft))
        )
        onClose()
    }

    const clear = () => {
        dispatch(clearDataFilter(layerId, dataKey))
        onClose()
    }

    return (
        <Popover
            reference={anchorRef}
            placement="bottom-start"
            arrow={false}
            maxWidth={320}
            onClickOutside={onClose}
            dataTest="data-table-filter-popover"
        >
            <form
                className={styles.popover}
                onSubmit={apply}
                aria-label={i18n.t('Filter by {{column}}', { column: name })}
            >
                <div className={styles.popoverHeader}>
                    <span className={styles.popoverTitle}>
                        <span className={styles.popoverTitleLabel}>
                            {i18n.t('Filter by')}
                        </span>{' '}
                        {name}
                    </span>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={i18n.t('Close')}
                        data-test="data-table-filter-close"
                    >
                        <IconCross16 />
                    </button>
                </div>
                <div className={styles.popoverBody}>
                    <ConditionRow
                        filterType={filterType}
                        draft={draft}
                        onChange={updateCondition}
                    />
                </div>
                <div className={styles.popoverFooter}>
                    <Button
                        small
                        secondary
                        disabled={!filter && isEmptyFilter(draft)}
                        onClick={clear}
                        dataTest="data-table-filter-clear"
                    >
                        {i18n.t('Clear')}
                    </Button>
                    <Button
                        small
                        primary
                        type="submit"
                        disabled={!canApply}
                        dataTest="data-table-filter-apply"
                    >
                        {i18n.t('Apply')}
                    </Button>
                </div>
            </form>
        </Popover>
    )
}

FilterPopover.propTypes = {
    anchorRef: PropTypes.object.isRequired,
    dataKey: PropTypes.string.isRequired,
    filterType: PropTypes.string.isRequired,
    layerId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    filter: PropTypes.object,
}

export default FilterPopover
