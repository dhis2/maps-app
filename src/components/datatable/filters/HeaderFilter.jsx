import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16, IconFilter16, Popover } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilter, setDataFilter } from '../../../actions/dataFilters.js'
import { toOptionValue } from '../../../util/filter.js'
import { parseRange } from '../../../util/legend.js'
import {
    FILTER_DATE,
    FILTER_NUMBER,
    FILTER_OPTIONS,
    FILTER_ORG_UNIT,
} from '../useTableData.js'
import DateFilter from './DateFilter.jsx'
import { isEmptyFilter, isSameFilter, isValidFilter } from './filterHelpers.js'
import NumberFilter from './NumberFilter.jsx'
import OptionsFilter from './OptionsFilter.jsx'
import styles from './styles/Filters.module.css'
import TextFilter from './TextFilter.jsx'

const LEGEND_KEYS = ['legend', 'range']

// Distinct values in the column with a count of rows for each.
// Legend classes keep the legend's order (highest first) and show a swatch.
const getOptions = (data, dataKey) => {
    const isLegend = LEGEND_KEYS.includes(dataKey)
    const byValue = new Map()
    data.forEach((d) => {
        const value = toOptionValue(d[dataKey])
        const option = byValue.get(value) || {
            value,
            label: value,
            count: 0,
            color: isLegend ? d.color : undefined,
            rangeStart: isLegend && d.range ? parseRange(d.range)[0] : null,
        }
        option.count++
        byValue.set(value, option)
    })
    const options = [...byValue.values()]
    if (isLegend) {
        return options.sort(
            (a, b) => (b.rangeStart ?? -Infinity) - (a.rangeStart ?? -Infinity)
        )
    }
    const isNumeric = options.every((o) => o.value === '' || !isNaN(o.value))
    return options.sort((a, b) =>
        isNumeric
            ? Number(a.value) - Number(b.value)
            : a.label.localeCompare(b.label)
    )
}

const HeaderFilter = ({ layerId, header, filter, data }) => {
    const dispatch = useDispatch()
    const anchorRef = useRef()
    const [isOpen, setIsOpen] = useState(false)
    const [draft, setDraft] = useState()
    const { name, dataKey, filterType } = header
    const isActive = !!filter
    const canApply = !isSameFilter(draft, filter) && isValidFilter(draft)

    const options = useMemo(
        () =>
            isOpen && filterType === FILTER_OPTIONS
                ? getOptions(data || [], dataKey)
                : [],
        [isOpen, filterType, data, dataKey]
    )

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

    const open = (event) => {
        event.stopPropagation()
        setDraft(typeof filter === 'object' ? filter : undefined)
        setIsOpen(true)
    }

    const apply = (event) => {
        event?.preventDefault()
        if (!canApply) {
            return
        }
        if (isEmptyFilter(draft)) {
            dispatch(clearDataFilter(layerId, dataKey))
        } else {
            dispatch(setDataFilter(layerId, dataKey, draft))
        }
        setIsOpen(false)
    }

    const clear = () => {
        dispatch(clearDataFilter(layerId, dataKey))
        setIsOpen(false)
    }

    const Editor =
        filterType === FILTER_NUMBER
            ? NumberFilter
            : filterType === FILTER_OPTIONS
            ? OptionsFilter
            : filterType === FILTER_DATE
            ? DateFilter
            : TextFilter

    return (
        <>
            <button
                ref={anchorRef}
                className={cx(styles.filterButton, {
                    [styles.filterButtonActive]: isActive,
                    [styles.filterButtonOpen]: isOpen,
                })}
                onClick={open}
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
                <Popover
                    reference={anchorRef}
                    placement="bottom-start"
                    arrow={false}
                    maxWidth={320}
                    onClickOutside={() => setIsOpen(false)}
                    dataTest="data-table-filter-popover"
                >
                    <form
                        className={styles.popover}
                        onSubmit={apply}
                        aria-label={i18n.t('Filter by {{column}}', {
                            column: name,
                        })}
                    >
                        <div className={styles.popoverHeader}>
                            <span className={styles.popoverTitle}>
                                <span className={styles.popoverTitleLabel}>
                                    {i18n.t('Filter:')}
                                </span>{' '}
                                {name}
                            </span>
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={() => setIsOpen(false)}
                                aria-label={i18n.t('Close')}
                                title={i18n.t('Close')}
                                data-test="data-table-filter-close"
                            >
                                <IconCross16 />
                            </button>
                        </div>
                        <div className={styles.popoverBody}>
                            <Editor
                                draft={draft}
                                options={options}
                                onChange={setDraft}
                            />
                        </div>
                        <div className={styles.popoverFooter}>
                            <Button
                                small
                                secondary
                                disabled={!isActive && isEmptyFilter(draft)}
                                onClick={clear}
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
