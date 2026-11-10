import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16, Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilter, setDataFilter } from '../../../actions/dataFilters.js'
import { FILTER_NUMBER, FILTER_TEXT } from '../../../constants/dataTable.js'
import {
    isEmptyFilter,
    isSameFilter,
    isValidFilter,
} from '../../../util/filter.js'
import NumberFilter from './NumberFilter.jsx'
import styles from './styles/Filters.module.css'
import TextFilter from './TextFilter.jsx'

const EDITORS = {
    [FILTER_TEXT]: TextFilter,
    [FILTER_NUMBER]: NumberFilter,
}

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
    const [draft, setDraft] = useState(filter)
    const Editor = EDITORS[filterType]
    const canApply = !isSameFilter(draft, filter) && isValidFilter(draft)

    const apply = (event) => {
        event.preventDefault()
        if (!canApply) {
            return
        }
        dispatch(
            isEmptyFilter(draft)
                ? clearDataFilter(layerId, dataKey)
                : setDataFilter(layerId, dataKey, draft)
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
                    <Editor draft={draft} onChange={setDraft} />
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
