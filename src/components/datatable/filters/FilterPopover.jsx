import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16, Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilter, setDataFilter } from '../../../actions/dataFilters.js'
import {
    FILTER_VIEW_VALUES,
    FILTER_VIEW_VALUES_ONLY,
    SENTINEL_NO_VALUE,
} from '../../../constants/dataTable.js'
import { isMonospaceColumn } from '../../../util/dataTable.js'
import {
    getFilterError,
    hasCondition,
    isEmptyFilter,
    isSameFilter,
    normalizeFilter,
    updateNoValueForCondition,
} from '../../../util/filter.js'
import {
    countKeptRows,
    getListedValues,
    toAppliedFilter,
} from '../../../util/filterValues.js'
import ConditionRow from './ConditionRow.jsx'
import { getOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'
import useFilterValues from './useFilterValues.js'
import ValueList from './ValueList.jsx'

const getDraft = (filterType, filter) => ({
    type: filterType,
    operator: getOperators(filterType)[0]?.value,
    value: '',
    ...filter,
    excluded: filter?.excluded ?? [],
})

// Columns with few values open on their list, the others on their condition;
// a part folds into a link only while it is empty
const getOpenParts = (filterView, filter) => ({
    condition:
        filterView !== FILTER_VIEW_VALUES_ONLY &&
        (filterView !== FILTER_VIEW_VALUES || hasCondition(filter)),
    values:
        filterView === FILTER_VIEW_VALUES ||
        filterView === FILTER_VIEW_VALUES_ONLY ||
        !!filter?.excluded?.some((key) => key !== SENTINEL_NO_VALUE),
})

const FilterPopover = ({
    anchorRef,
    layerId,
    header,
    filterType,
    column,
    filter,
    onClose,
}) => {
    const { name, dataKey, renderer, filterView } = header
    const dispatch = useDispatch()
    const { allValues, values, matchOnLabel } = useFilterValues({
        header,
        ...column,
    })
    const [draft, setDraft] = useState(() => getDraft(filterType, filter))
    // "No value" follows the condition until the user checks or unchecks it
    const [isNoValueChosen, setIsNoValueChosen] = useState(
        () =>
            !!filter &&
            hasCondition(filter) !==
                filter.excluded?.includes(SENTINEL_NO_VALUE)
    )
    const [openParts, setOpenParts] = useState(() =>
        getOpenParts(filterView, filter)
    )

    const options = { matchOnLabel, allValues }
    const applied = normalizeFilter(toAppliedFilter(draft, options))
    const error = getFilterError(draft)
    const canApply = !isSameFilter(applied, filter) && !error
    const { listed, hidden } = getListedValues(values, draft, options)
    const keptCount = countKeptRows(values, draft, options)
    const totalCount = countKeptRows(values, { excluded: [] }, options)

    const updateCondition = (changes) =>
        setDraft((previous) => {
            const next = { ...previous, ...changes }
            return isNoValueChosen
                ? next
                : updateNoValueForCondition(previous, next)
        })

    const updateExcluded = (excluded, toggledKey) => {
        if (toggledKey === SENTINEL_NO_VALUE) {
            setIsNoValueChosen(true)
        }
        setDraft((previous) => ({ ...previous, excluded }))
    }

    const openPart = (part) =>
        setOpenParts((parts) => ({ ...parts, [part]: true }))

    const apply = (event) => {
        event.preventDefault()
        if (!canApply) {
            return
        }
        dispatch(
            isEmptyFilter(applied)
                ? clearDataFilter(layerId, dataKey)
                : setDataFilter(layerId, dataKey, applied)
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
            observePopperResize
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
                    {openParts.condition && (
                        <ConditionRow
                            filterType={filterType}
                            draft={draft}
                            onChange={updateCondition}
                        />
                    )}
                    {!openParts.condition &&
                        filterView !== FILTER_VIEW_VALUES_ONLY && (
                            <button
                                type="button"
                                className={styles.linkButton}
                                onClick={() => openPart('condition')}
                                data-test="data-table-filter-add-condition"
                            >
                                {i18n.t('+ Add a condition')}
                            </button>
                        )}
                    {openParts.values ? (
                        <ValueList
                            listed={listed}
                            hidden={hidden}
                            excluded={draft.excluded}
                            renderer={renderer}
                            isMonospace={isMonospaceColumn(header)}
                            onChange={updateExcluded}
                        />
                    ) : (
                        <button
                            type="button"
                            className={styles.linkButton}
                            onClick={() => openPart('values')}
                            data-test="data-table-filter-pick-values"
                        >
                            {i18n.t('Pick values')}
                        </button>
                    )}
                </div>
                <div className={styles.popoverFooter}>
                    <span
                        className={styles.preview}
                        aria-live="polite"
                        data-test="data-table-filter-preview"
                    >
                        {!error &&
                            i18n.t('{{kept}} of {{total}} rows', {
                                kept: keptCount,
                                total: totalCount,
                            })}
                    </span>
                    <Button
                        small
                        secondary
                        disabled={!filter && isEmptyFilter(applied)}
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
    column: PropTypes.shape({
        rows: PropTypes.array.isRequired,
        filters: PropTypes.object,
        keyAnalysisDigitGroupSeparator: PropTypes.string,
        orgUnitIdToName: PropTypes.instanceOf(Map),
    }).isRequired,
    filterType: PropTypes.string.isRequired,
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        filterView: PropTypes.string,
        renderer: PropTypes.string,
    }).isRequired,
    layerId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    filter: PropTypes.object,
}

export default FilterPopover
