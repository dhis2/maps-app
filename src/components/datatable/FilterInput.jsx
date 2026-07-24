import i18n from '@dhis2/d2-i18n'
import { Input, IconFilter16, IconSync16 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    RENDERER_COLOR,
    RENDERER_ICON,
    TYPE_NUMBER,
    // TYPE_DATE,
    // TYPE_DATETIME,
    // TYPE_TIME,
} from '../../constants/dataTable.js'
import useOptionSet from '../../hooks/useOptionSet.js'
import {
    getCyclicIndex,
    getDisplayValue,
    getFilteredOptions,
    getPopoverWidth,
    getSelectedAndAppliedString,
    measureMaxTextWidth,
    toHighlightedIndex,
    toOptionIndex,
    OPTION_ROW_HEIGHT,
    MAX_LIST_HEIGHT,
} from '../../util/filterInput.js'
import {
    getInvertibleValues,
    reverseSelection,
    toggleAnyValue,
    toggleRealValue,
} from '../../util/filterSelection.js'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import Checkbox from '../core/Checkbox.jsx'
// import DateGroupFilterInput from './DateGroupFilterInput.jsx'
import {
    FilterDropdownPopover,
    getDropdownPlacement,
} from './FilterDropdownPopover.jsx'
import FilterHelpTooltip from './FilterHelpTooltip.jsx'
import styles from './styles/FilterInput.module.css'

const NUMERIC_HELP_HEIGHT = 140
const TEXT_HELP_HEIGHT = 56
const NUMERIC_FILTER_HELP = (
    <div>
        <div>{i18n.t('Select values, or type a numerical filter:')}</div>
        <div>{'> 5 — ' + i18n.t('greater than 5')}</div>
        <div>{'>= 5 — ' + i18n.t('greater than or equal to 5')}</div>
        <div>{'< 5, <= 5 — ' + i18n.t('less than (or equal to) 5')}</div>
        <div>{'2, > 8 — ' + i18n.t('equal to 2 OR greater than 8')}</div>
        <div>{'> 3 & < 8 — ' + i18n.t('greater than 3 AND less than 8')}</div>
    </div>
)
const TEXT_FILTER_HELP = (
    <div>
        <div>{i18n.t('Select values, or type text')}</div>
        <div>{i18n.t('to match rows that contain it')}</div>
    </div>
)
const NUMERIC_INPUT_DISALLOWED = /[^0-9.\-<>=,&\s]/g

const SearchableFilterPopover = React.memo(function SearchableFilterPopover({
    dataKey,
    name,
    layerId,
    filterValue,
    options,
    resolveLabel,
    type,
    renderer,
    allowCustomFilter = true,
}) {
    const dispatch = useDispatch()
    const anchorRef = useRef(null)
    const listRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const { selected, appliedString } = getSelectedAndAppliedString(filterValue)

    const openPopover = () => {
        setSearchText(appliedString)
        setHighlightedIndex(-1)
        setIsOpen(true)
    }

    const closePopover = () => setIsOpen(false)

    const anchorRect = anchorRef.current?.getBoundingClientRect()
    const { dropdownPlacement, dropdownSide, tooltipPlacement } =
        getDropdownPlacement(anchorRect)

    const applyValues = (next) =>
        next.length
            ? dispatch(setDataFilter(layerId, dataKey, next))
            : dispatch(clearDataFilter(layerId, dataKey))

    const toggleValue = (value) => {
        const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value]
        applyValues(next)
    }

    const applyCustomFilter = (text) =>
        text
            ? dispatch(setDataFilter(layerId, dataKey, text))
            : dispatch(clearDataFilter(layerId, dataKey))

    const isIconColumn = renderer === RENDERER_ICON

    const renderOptionLabel = (value) =>
        isIconColumn ? (
            <span className={styles.iconOption}>
                <img
                    className={styles.iconOptionThumbnail}
                    src={value}
                    alt=""
                    onError={(e) => {
                        e.target.style.visibility = 'hidden'
                    }}
                />
                {value.split('/').pop()}
            </span>
        ) : (
            resolveLabel(value)
        )

    const hasNotSetOption = useMemo(
        () => options.some(({ value }) => value === SENTINEL_NO_VALUE),
        [options]
    )
    const realOptions = useMemo(
        () => options.filter(({ value }) => value !== SENTINEL_NO_VALUE),
        [options]
    )
    const realValues = useMemo(
        () => realOptions.map((o) => o.value),
        [realOptions]
    )
    const anyValueActive = selected.includes(SENTINEL_ANY_VALUE)

    const popoverWidth = useMemo(() => {
        const labels = realOptions.map((o) => resolveLabel(o.value))
        if (hasNotSetOption) {
            labels.push(resolveLabel(SENTINEL_NO_VALUE))
        }
        const font = `11px ${getComputedStyle(document.body).fontFamily}`
        const maxLabelWidth = measureMaxTextWidth(labels, font)
        return getPopoverWidth(maxLabelWidth)
        // resolveLabel's identity only changes alongside type/optionSet, which don't change without realOptions changing too
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realOptions, hasNotSetOption])

    const onToggleAnyValue = () => applyValues(toggleAnyValue(selected))

    const invertibleValues = useMemo(
        () => getInvertibleValues(hasNotSetOption, realValues),
        [hasNotSetOption, realValues]
    )

    const onToggleRealValue = (value) =>
        applyValues(toggleRealValue(selected, value, realValues))

    const onReverseSelection = () =>
        applyValues(reverseSelection(selected, realValues, hasNotSetOption))

    const trimmedSearch = searchText.trim()
    const normalizedSearch = trimmedSearch.toLowerCase()
    const filteredOptions = useMemo(
        () =>
            getFilteredOptions({
                realOptions,
                trimmedSearch,
                normalizedSearch,
                type,
                resolveLabel,
            }),
        [realOptions, trimmedSearch, normalizedSearch, type, resolveLabel]
    )
    const showCustomFilterRow = allowCustomFilter && normalizedSearch !== ''
    const totalCount = filteredOptions.length + (showCustomFilterRow ? 1 : 0)

    const customFilterTag =
        type === TYPE_NUMBER ? i18n.t('Use filter') : i18n.t('Contains')

    const hasActiveFilter = selected.length > 0 || appliedString !== ''

    const onSearchChange = ({ value }) => {
        const sanitized =
            type === TYPE_NUMBER
                ? value.replace(NUMERIC_INPUT_DISALLOWED, '')
                : value
        setSearchText(sanitized)
        setHighlightedIndex(-1)

        const trimmed = sanitized.trim()
        if (trimmed === '') {
            if (hasActiveFilter) {
                dispatch(clearDataFilter(layerId, dataKey))
            }
            return
        }

        if (!allowCustomFilter) {
            return
        }

        applyCustomFilter(trimmed)
    }

    const scrollHighlightedIntoView = (index) => {
        const optionIndex = toOptionIndex(index, showCustomFilterRow)
        if (optionIndex >= 0 && optionIndex < filteredOptions.length) {
            listRef.current?.scrollToIndex({
                index: optionIndex,
                align: 'center',
            })
        }
    }

    const onEnterKey = () => {
        if (highlightedIndex === -1) {
            if (showCustomFilterRow) {
                applyCustomFilter(searchText.trim())
            }
            return
        }
        if (showCustomFilterRow && highlightedIndex === 0) {
            applyCustomFilter(searchText.trim())
            return
        }
        const optionIndex = toOptionIndex(highlightedIndex, showCustomFilterRow)
        if (optionIndex >= 0 && optionIndex < filteredOptions.length) {
            toggleValue(filteredOptions[optionIndex].value)
        }
    }

    const onSearchKeyDown = (_, event) => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                setHighlightedIndex((i) => {
                    const next = getCyclicIndex(i, totalCount, 1)
                    scrollHighlightedIntoView(next)
                    return next
                })
                break
            case 'ArrowUp':
                event.preventDefault()
                setHighlightedIndex((i) => {
                    const next = getCyclicIndex(i, totalCount, -1)
                    scrollHighlightedIntoView(next)
                    return next
                })
                break
            case 'Enter':
                event.preventDefault()
                onEnterKey()
                closePopover()
                break
            case 'Escape':
                event.preventDefault()
                closePopover()
                break
            default:
                break
        }
    }

    const displayValue = getDisplayValue({
        isOpen,
        searchText,
        selected,
        appliedString,
    })

    const mainInput = (
        <Input
            dense
            clearable
            dataTest={`data-table-column-filter-search-${name}`}
            placeholder={
                type === TYPE_NUMBER
                    ? i18n.t('Search or type > 5, < 8…')
                    : i18n.t('Search')
            }
            value={displayValue}
            onFocus={() => {
                if (!isOpen) {
                    openPopover()
                }
            }}
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
        />
    )

    return (
        <div className={styles.filterTrigger} ref={anchorRef}>
            <FilterHelpTooltip
                content={
                    type === TYPE_NUMBER
                        ? NUMERIC_FILTER_HELP
                        : TEXT_FILTER_HELP
                }
                placement={tooltipPlacement}
                estimatedHeight={
                    type === TYPE_NUMBER
                        ? NUMERIC_HELP_HEIGHT
                        : TEXT_HELP_HEIGHT
                }
                dataTest="data-table-filter-help"
            >
                {mainInput}
            </FilterHelpTooltip>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement={dropdownPlacement}
                    onClickOutside={closePopover}
                    className={cx(
                        styles.dropdownPopper,
                        dropdownSide === 'top' && styles.dropdownPopperAbove
                    )}
                >
                    <div
                        className={cx(styles.searchableFilterPopover, {
                            [styles.reversedOrder]: dropdownSide === 'top',
                        })}
                        style={{ width: `${popoverWidth}px` }}
                    >
                        {showCustomFilterRow && (
                            <button
                                type="button"
                                className={cx(styles.customFilterRow, {
                                    [styles.highlighted]:
                                        highlightedIndex === 0,
                                })}
                                data-test={`data-table-column-filter-custom-${name}`}
                                onClick={() => {
                                    applyCustomFilter(searchText.trim())
                                    closePopover()
                                }}
                            >
                                <IconFilter16 />
                                <span className={styles.customFilterTag}>
                                    {customFilterTag}
                                </span>
                                <span className={styles.customFilterExpr}>
                                    {searchText.trim()}
                                </span>
                            </button>
                        )}
                        <div className={styles.pinnedOptions}>
                            <button
                                type="button"
                                className={styles.reverseSelectionButton}
                                disabled={invertibleValues.length === 0}
                                title={i18n.t('Reverse selection')}
                                aria-label={i18n.t('Reverse selection')}
                                data-test={`data-table-column-filter-reverse-${name}`}
                                onClick={onReverseSelection}
                            >
                                <IconSync16 />
                            </button>
                            <Checkbox
                                label={i18n.t('Any value')}
                                checked={anyValueActive}
                                onChange={onToggleAnyValue}
                                className={cx(
                                    styles.specialOption,
                                    styles.denseCheckbox
                                )}
                                dataTest={`data-table-column-filter-any-${name}`}
                            />
                            {hasNotSetOption && (
                                <Checkbox
                                    label={resolveLabel(SENTINEL_NO_VALUE)}
                                    checked={selected.includes(
                                        SENTINEL_NO_VALUE
                                    )}
                                    onChange={() =>
                                        toggleValue(SENTINEL_NO_VALUE)
                                    }
                                    className={cx(
                                        styles.specialOption,
                                        styles.denseCheckbox
                                    )}
                                    dataTest={`data-table-column-filter-novalue-${name}`}
                                />
                            )}
                        </div>
                        <div className={styles.multiSelectPopover}>
                            {!showCustomFilterRow &&
                                (options.length === 0 ? (
                                    <div className={styles.noResults}>
                                        {i18n.t(
                                            'Too many values to list - type to filter this column'
                                        )}
                                    </div>
                                ) : (
                                    filteredOptions.length === 0 && (
                                        <div className={styles.noResults}>
                                            {i18n.t('No matches')}
                                        </div>
                                    )
                                ))}
                            {filteredOptions.length > 0 && (
                                <Virtuoso
                                    ref={listRef}
                                    style={{
                                        height: Math.min(
                                            filteredOptions.length *
                                                OPTION_ROW_HEIGHT,
                                            MAX_LIST_HEIGHT
                                        ),
                                    }}
                                    increaseViewportBy={{
                                        top: 0,
                                        bottom: OPTION_ROW_HEIGHT * 2,
                                    }}
                                    data={filteredOptions}
                                    fixedItemHeight={OPTION_ROW_HEIGHT}
                                    computeItemKey={(_, option) => option.value}
                                    itemContent={(index, option) => (
                                        <Checkbox
                                            label={renderOptionLabel(
                                                option.value
                                            )}
                                            checked={
                                                anyValueActive ||
                                                selected.includes(option.value)
                                            }
                                            onChange={() =>
                                                onToggleRealValue(option.value)
                                            }
                                            className={cx(
                                                styles.denseCheckbox,
                                                (dataKey === 'id' ||
                                                    renderer ===
                                                        RENDERER_COLOR) &&
                                                    styles.monoOption,
                                                highlightedIndex ===
                                                    toHighlightedIndex(
                                                        index,
                                                        showCustomFilterRow
                                                    ) && styles.highlighted
                                            )}
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </FilterDropdownPopover>
            )}
        </div>
    )
})

SearchableFilterPopover.propTypes = {
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string }))
        .isRequired,
    resolveLabel: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    allowCustomFilter: PropTypes.bool,
    filterValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    layerId: PropTypes.string,
    renderer: PropTypes.string,
}

const PlainSearchableFilter = (props) => {
    const { type } = props
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const resolveLabel = useCallback(
        (value) => {
            if (value === SENTINEL_NO_VALUE) {
                return i18n.t('No value')
            }
            return type === TYPE_NUMBER
                ? formatWithSeparator(
                      Number(value),
                      keyAnalysisDigitGroupSeparator
                  )
                : value
        },
        [type, keyAnalysisDigitGroupSeparator]
    )

    return <SearchableFilterPopover {...props} resolveLabel={resolveLabel} />
}

PlainSearchableFilter.propTypes = {
    type: PropTypes.string,
}

const OptionSetSearchableFilter = ({ optionSetId, ...props }) => {
    const { optionSet } = useOptionSet(optionSetId)
    const optionByCode = useMemo(() => {
        const map = new Map()
        optionSet?.options.forEach((o) => map.set(o.code, o))
        return map
    }, [optionSet])
    const resolveLabel = useCallback(
        (value) =>
            value === SENTINEL_NO_VALUE
                ? i18n.t('No value')
                : optionByCode.get(value)?.name ?? value,
        [optionByCode]
    )
    return (
        <SearchableFilterPopover
            {...props}
            resolveLabel={resolveLabel}
            allowCustomFilter={false}
        />
    )
}

OptionSetSearchableFilter.propTypes = {
    optionSetId: PropTypes.string.isRequired,
}

const FilterInput = React.memo(function FilterInput({
    type,
    dataKey,
    name,
    options,
    optionSetId,
    renderer,
}) {
    const dataTable = useSelector((state) => state.dataTable)
    const map = useSelector((state) => state.map)

    const overlay =
        dataTable && map.mapViews.find((layer) => layer.id === dataTable)

    let layerId
    let filters
    if (overlay) {
        layerId = overlay.id
        filters = overlay.dataFilters || {}
    }

    const filterValue = filters?.[dataKey]

    /* const isDateType =
        type === TYPE_DATE || type === TYPE_DATETIME || type === TYPE_TIME */

    /* return isDateType ? (
        <DateGroupFilterInput
            dataKey={dataKey}
            name={name}
            layerId={layerId}
            filterValue={filterValue}
            options={options ?? []}
            type={type}
        />
    ) : */

    return optionSetId ? (
        <OptionSetSearchableFilter
            dataKey={dataKey}
            name={name}
            layerId={layerId}
            filterValue={filterValue}
            options={options ?? []}
            optionSetId={optionSetId}
            type={type}
            renderer={renderer}
        />
    ) : (
        <PlainSearchableFilter
            dataKey={dataKey}
            name={name}
            layerId={layerId}
            filterValue={filterValue}
            options={options ?? []}
            type={type}
            renderer={renderer}
        />
    )
})

FilterInput.propTypes = {
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    optionSetId: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })),
    renderer: PropTypes.string,
}

export default FilterInput
