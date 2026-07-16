import i18n from '@dhis2/d2-i18n'
import { Input, Popper, Portal, IconFilter16, IconSync16 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
} from '../../constants/dataTable.js'
import useOptionSet from '../../hooks/useOptionSet.js'
import { numericFilter } from '../../util/filter.js'
import {
    getInvertibleValues,
    reverseSelection,
    toggleAnyValue,
    toggleRealValue,
} from '../../util/filterSelection.js'
import Checkbox from '../core/Checkbox.jsx'
import {
    FilterDropdownPopover,
    getDropdownPlacement,
} from './FilterDropdownPopover.jsx'
import styles from './styles/FilterInput.module.css'

const OPTION_ROW_HEIGHT = 28 // Checkbox rows are a fixed height so the list can be virtualized
const MAX_LIST_HEIGHT = 260
const MIN_POPOVER_WIDTH = 140
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

const helpTooltipModifiers = [
    { name: 'offset', options: { offset: [0, 4] } },
    { name: 'flip', enabled: false },
]

const FilterHelpTooltip = ({
    content,
    placement,
    estimatedHeight,
    dataTest,
    children,
}) => {
    const [open, setOpen] = useState(false)
    const referenceRef = useRef(null)
    const openTimerRef = useRef(null)
    const closeTimerRef = useRef(null)

    const onOpen = () => {
        clearTimeout(closeTimerRef.current)
        openTimerRef.current = setTimeout(() => setOpen(true), 200)
    }

    const onClose = () => {
        clearTimeout(openTimerRef.current)
        closeTimerRef.current = setTimeout(() => setOpen(false), 200)
    }

    useEffect(
        () => () => {
            clearTimeout(openTimerRef.current)
            clearTimeout(closeTimerRef.current)
        },
        []
    )

    const referenceRect = referenceRef.current?.getBoundingClientRect()
    let spaceAvailable = Infinity
    if (referenceRect) {
        spaceAvailable =
            placement === 'top'
                ? referenceRect.top
                : window.innerHeight - referenceRect.bottom
    }
    const hasRoom = spaceAvailable >= estimatedHeight

    return (
        <span
            ref={referenceRef}
            onMouseOver={onOpen}
            onMouseOut={onClose}
            onFocus={onOpen}
            onBlur={onClose}
            data-test={`${dataTest}-reference`}
        >
            {children}
            {open && hasRoom && (
                <Portal>
                    <Popper
                        placement={placement}
                        reference={referenceRef}
                        modifiers={helpTooltipModifiers}
                    >
                        <div
                            className={styles.filterHelpTooltip}
                            data-test={`${dataTest}-content`}
                        >
                            {content}
                        </div>
                    </Popper>
                </Portal>
            )}
        </span>
    )
}

FilterHelpTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    dataTest: PropTypes.string.isRequired,
    estimatedHeight: PropTypes.number.isRequired,
    placement: PropTypes.oneOf(['top', 'bottom']).isRequired,
}

const getFilteredOptions = ({
    realOptions,
    trimmedSearch,
    normalizedSearch,
    type,
    resolveLabel,
}) => {
    if (!trimmedSearch) {
        return realOptions
    }
    if (type === 'number') {
        return realOptions.filter(({ value }) =>
            numericFilter(Number(value), trimmedSearch)
        )
    }
    return realOptions.filter(({ value }) =>
        resolveLabel(value).toLowerCase().includes(normalizedSearch)
    )
}

const getDisplayValue = ({ isOpen, searchText, selected, appliedString }) => {
    if (isOpen) {
        return searchText
    }
    if (selected.length) {
        return i18n.t('{{count}} selected', { count: selected.length })
    }
    return appliedString
}

const getSelectedAndAppliedString = (filterValue) => ({
    selected: Array.isArray(filterValue) ? filterValue : [],
    appliedString: typeof filterValue === 'string' ? filterValue : '',
})

const SearchableFilterPopover = ({
    dataKey,
    name,
    layerId,
    filterValue,
    options,
    resolveLabel,
    type,
    allowCustomFilter = true,
}) => {
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
    const anchorWidth = anchorRect?.width
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

    const hasNotSetOption = options.some(
        ({ value }) => value === SENTINEL_NO_VALUE
    )
    const realOptions = options.filter(
        ({ value }) => value !== SENTINEL_NO_VALUE
    )
    const realValues = realOptions.map((o) => o.value)
    const anyValueActive = selected.includes(SENTINEL_ANY_VALUE)

    const onToggleAnyValue = () => applyValues(toggleAnyValue(selected))

    const invertibleValues = getInvertibleValues(hasNotSetOption, realValues)

    const onToggleRealValue = (value) =>
        applyValues(toggleRealValue(selected, value, realValues))

    const onReverseSelection = () =>
        applyValues(reverseSelection(selected, realValues, hasNotSetOption))

    const trimmedSearch = searchText.trim()
    const normalizedSearch = trimmedSearch.toLowerCase()
    const filteredOptions = getFilteredOptions({
        realOptions,
        trimmedSearch,
        normalizedSearch,
        type,
        resolveLabel,
    })
    const hasExactMatch = filteredOptions.some(
        ({ value }) => resolveLabel(value).toLowerCase() === normalizedSearch
    )
    const showCustomFilterRow =
        allowCustomFilter && normalizedSearch !== '' && !hasExactMatch
    const totalCount = filteredOptions.length + (showCustomFilterRow ? 1 : 0)

    const customFilterTag =
        type === 'number' ? i18n.t('Use filter') : i18n.t('Contains')

    const hasActiveFilter = selected.length > 0 || appliedString !== ''

    const onSearchChange = ({ value }) => {
        const sanitized =
            type === 'number'
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

        const normalized = trimmed.toLowerCase()
        const exactMatch = options.some(
            ({ value: optionValue }) =>
                resolveLabel(optionValue).toLowerCase() === normalized
        )
        if (!exactMatch) {
            applyCustomFilter(trimmed)
        }
    }

    const scrollHighlightedIntoView = (index) => {
        const optionIndex = showCustomFilterRow ? index - 1 : index
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
        const optionIndex = showCustomFilterRow
            ? highlightedIndex - 1
            : highlightedIndex
        if (optionIndex >= 0 && optionIndex < filteredOptions.length) {
            toggleValue(filteredOptions[optionIndex].value)
        }
    }

    const onSearchKeyDown = (_, event) => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                setHighlightedIndex((i) => {
                    const next = totalCount ? (i + 1) % totalCount : -1
                    scrollHighlightedIntoView(next)
                    return next
                })
                break
            case 'ArrowUp':
                event.preventDefault()
                setHighlightedIndex((i) => {
                    const next = totalCount
                        ? (i - 1 + totalCount) % totalCount
                        : -1
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
                type === 'number'
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
                    type === 'number' ? NUMERIC_FILTER_HELP : TEXT_FILTER_HELP
                }
                placement={tooltipPlacement}
                estimatedHeight={
                    type === 'number' ? NUMERIC_HELP_HEIGHT : TEXT_HELP_HEIGHT
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
                        style={{
                            minWidth: anchorWidth
                                ? `${Math.max(
                                      anchorWidth,
                                      MIN_POPOVER_WIDTH
                                  )}px`
                                : undefined,
                        }}
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
                                className={styles.specialOption}
                                style={{ margin: '4px 0' }}
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
                                    className={styles.specialOption}
                                    style={{ margin: '4px 0' }}
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
                                            label={resolveLabel(option.value)}
                                            checked={
                                                anyValueActive ||
                                                selected.includes(option.value)
                                            }
                                            onChange={() =>
                                                onToggleRealValue(option.value)
                                            }
                                            className={cx(
                                                (dataKey === 'id' ||
                                                    dataKey === 'color') &&
                                                    styles.monoOption,
                                                highlightedIndex ===
                                                    (showCustomFilterRow
                                                        ? index + 1
                                                        : index) &&
                                                    styles.highlighted
                                            )}
                                            style={{ margin: '4px 0' }}
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
}

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
}

const PlainSearchableFilter = (props) => (
    <SearchableFilterPopover
        {...props}
        resolveLabel={(value) =>
            value === SENTINEL_NO_VALUE ? i18n.t('No value') : value
        }
    />
)

const OptionSetSearchableFilter = ({ optionSetId, ...props }) => {
    const { optionSet } = useOptionSet(optionSetId)
    const resolveLabel = (value) =>
        value === SENTINEL_NO_VALUE
            ? i18n.t('No value')
            : optionSet?.options.find((o) => o.code === value)?.name ?? value
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

const FilterInput = ({ type, dataKey, name, options, optionSetId }) => {
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

    return optionSetId ? (
        <OptionSetSearchableFilter
            dataKey={dataKey}
            name={name}
            layerId={layerId}
            filterValue={filterValue}
            options={options ?? []}
            optionSetId={optionSetId}
            type={type}
        />
    ) : (
        <PlainSearchableFilter
            dataKey={dataKey}
            name={name}
            layerId={layerId}
            filterValue={filterValue}
            options={options ?? []}
            type={type}
        />
    )
}

FilterInput.propTypes = {
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    optionSetId: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })),
}

export default FilterInput
