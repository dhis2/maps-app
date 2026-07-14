import i18n from '@dhis2/d2-i18n'
import {
    Input,
    Layer,
    Popper,
    Portal,
    IconFilter16,
    IconSync16,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import useOptionSet from '../../hooks/useOptionSet.js'
import { numericFilter, ANY_VALUE_KEY } from '../../util/filter.js'
import Checkbox from '../core/Checkbox.jsx'
import styles from './styles/FilterInput.module.css'

// Must match useTableData.js's NOT_SET_VALUE - not imported directly from
// there to avoid pulling that module's heavy transitive dependencies
// (map/earth-engine loaders) into this component.
const NOT_SET_VALUE = ''

// Checkbox rows are a fixed height (dense label + the 4px/4px margin set
// below), so the list can be virtualized with a known row size instead of
// measuring each one - this is what lets a column's full value list (no
// cap - see useTableData.js) stay cheap to render regardless of size.
const OPTION_ROW_HEIGHT = 28
const MAX_LIST_HEIGHT = 260

// Rough upper bound (in px) on the dropdown's own rendered height (the
// checkbox list capped at MAX_LIST_HEIGHT, plus its padding/gap and the
// pinned custom-filter row) - used to decide, once per render, whether
// every column's dropdown should open below or above (see
// SearchableFilterPopover's dropdownSide). All columns share the same
// header row, so this is computed the same way for each of them and they
// always agree - there's no per-column flip, just a single below/above
// choice that applies to the whole row.
const ESTIMATED_POPOVER_HEIGHT = MAX_LIST_HEIGHT + 80

// Floor for the dropdown's width - narrow columns still need enough room
// for the checkbox list/search text to be usable, so the popover shouldn't
// shrink down to match a very narrow trigger's own width.
const MIN_POPOVER_WIDTH = 140

// Rough content heights (in px) for the two tooltip variants, used only to
// decide whether there's enough room to show the tooltip at all - see
// FilterHelpTooltip's hasRoom check.
const NUMERIC_HELP_HEIGHT = 140
const TEXT_HELP_HEIGHT = 40

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
        {i18n.t('Select values, or type text to match rows that contain it.')}
    </div>
)

// Everything a numeric filter expression can legally contain (see
// isTrueFilter/numericFilter in util/filter.js): digits, decimals,
// negative signs, comparison operators, and the AND/OR separators.
const NUMERIC_INPUT_DISALLOWED = /[^0-9.\-<>=,&\s]/g

// @dhis2-ui/popper's Popper component always merges in its own base flip
// modifier unless a modifier of the same name is passed in to override it -
// omitting flip from this list does NOT turn it off, it just leaves the
// base one active. Disabling it by name (rather than simply not mentioning
// it) is what actually stops it from silently overriding `placement`.
const helpTooltipModifiers = [
    { name: 'offset', options: { offset: [0, 4] } },
    { name: 'flip', enabled: false },
]

// @dhis2/ui's Tooltip always includes a flip modifier that checks the
// nearest scrolling ancestor's clip box for room (see the identical
// TopTooltip in DataTable.jsx) - the column header is position:sticky,
// pinned to the top of that scrolling container, so the flip modifier
// always reports "no room above" and flips to the bottom regardless of
// the requested placement. This variant skips that modifier so it always
// opens on whichever side the caller passes (SearchableFilterPopover always
// passes the opposite of the dropdown's own side) - and, since it can no
// longer flip out of the way, it checks for itself whether there's
// actually room on that side before showing anything at all, rather than
// risk covering other UI or getting clipped.
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

// See helpTooltipModifiers above - the flip modifier has to be disabled by
// name, not just left out, or the Popper component's own base flip modifier
// stays active underneath and keeps overriding `placement` per-column.
const dropdownModifiers = [
    { name: 'offset', options: { offset: [0, 0] } },
    { name: 'flip', enabled: false },
]

// @dhis2/ui's Popover always includes its own flip modifier with no way to
// opt out, which lets each column decide independently based on its own
// available space - a column near the bottom of the table could open
// upward while every other column opens downward. This reimplements just
// enough of Popover - Layer for the backdrop/click-outside behavior, Popper
// for positioning, flip disabled - so `placement` is always honored exactly;
// the caller (SearchableFilterPopover) computes one placement per render
// from the shared header row's position, so every column's dropdown agrees.
export const FilterDropdownPopover = ({
    reference,
    placement,
    onClickOutside,
    className,
    children,
}) => (
    <Layer onBackdropClick={onClickOutside}>
        <Popper
            placement={placement}
            reference={reference}
            modifiers={dropdownModifiers}
            className={className}
        >
            {children}
        </Popper>
    </Layer>
)

FilterDropdownPopover.propTypes = {
    children: PropTypes.node.isRequired,
    placement: PropTypes.oneOf(['top-start', 'bottom-start']).isRequired,
    reference: PropTypes.object.isRequired,
    onClickOutside: PropTypes.func.isRequired,
    className: PropTypes.string,
}

// See onToggleAnyValue - turning "Any value" on collapses any individually
// -picked real values into just the wildcard, off unticks every real value
// along with it. "No value" carries through untouched either way.
const getAnyValueToggleResult = (anyValueActive, keepNotSet) => {
    if (anyValueActive) {
        return keepNotSet ? [NOT_SET_VALUE] : []
    }
    return keepNotSet ? [ANY_VALUE_KEY, NOT_SET_VALUE] : [ANY_VALUE_KEY]
}

// See onToggleRealValue - once every real value ends up ticked, that's the
// same state as "Any value" being active, so it collapses into the wildcard
// rather than a literal array that happens to list them all.
const getRealValueToggleResult = (next, allRealValuesChecked) => {
    if (!allRealValuesChecked) {
        return next
    }
    return next.includes(NOT_SET_VALUE)
        ? [ANY_VALUE_KEY, NOT_SET_VALUE]
        : [ANY_VALUE_KEY]
}

// See "Numeric columns narrow..." comment at the filteredOptions call site -
// numeric columns match the typed text as a numericFilter expression,
// string columns match it as a case-insensitive substring of the resolved
// label.
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

// Closed, this reads like the old trigger button ("3 selected", the applied
// filter text, or empty so the "Search" placeholder shows). Open, it's a
// live, editable search/filter field - the same input serves both roles
// instead of a button revealing a separate one.
const getDisplayValue = ({ isOpen, searchText, selected, appliedString }) => {
    if (isOpen) {
        return searchText
    }
    if (selected.length) {
        return i18n.t('{{count}} selected', { count: selected.length })
    }
    return appliedString
}

// Widget state is derived straight from the applied `filterValue` (never
// tracked in parallel) - an array means a multi-select filter, a string
// means a custom typed one, anything else (no filter applied) is neither.
const getSelectedAndAppliedString = (filterValue) => ({
    selected: Array.isArray(filterValue) ? filterValue : [],
    appliedString: typeof filterValue === 'string' ? filterValue : '',
})

// Every column's filter trigger sits in the same header row, so this
// resolves to the same answer for all of them - below by default, or above
// if the row doesn't have room to open the dropdown downward (e.g. the
// table is short, or the page is scrolled so the row sits near the bottom
// of the viewport). That single choice is what keeps every column's
// dropdown opening on the same side. The help tooltip always takes the
// opposite side, so the two never compete for space.
export const getDropdownPlacement = (anchorRect) => {
    const dropdownSide =
        anchorRect != null &&
        window.innerHeight - anchorRect.bottom < ESTIMATED_POPOVER_HEIGHT
            ? 'top'
            : 'bottom'
    return {
        dropdownSide,
        dropdownPlacement: `${dropdownSide}-start`,
        tooltipPlacement: dropdownSide === 'top' ? 'bottom' : 'top',
    }
}

// Every value "Reverse selection" can flip - the column's full value
// domain, not just whatever the current search happens to narrow the list
// down to (search is for finding/toggling individual values, not for
// scoping a bulk action).
const getInvertibleValues = (hasNotSetOption, realOptions) =>
    hasNotSetOption
        ? [NOT_SET_VALUE, ...realOptions.map((o) => o.value)]
        : realOptions.map((o) => o.value)

// Shared popover UI — label resolution is injected so it never needs to
// know whether it's an option-set column or a plain categorical one.
// State is derived straight from the applied `filterValue` (never tracked
// in parallel), so picking a value and applying a custom filter stay
// mutually exclusive for free: whichever one is dispatched last is what
// `filterValue` holds, and both branches read from it the same way.
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

    // Read directly from the DOM rather than a resize observer: the trigger
    // is already mounted (this only matters once isOpen is true, by which
    // point it's had at least one paint) and column widths only change on
    // table resize, when the popover is closed anyway.
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

    // "No value" is pinned above the list with "Any value" (see the render
    // below) rather than mixed in among the column's real distinct values,
    // so it's excluded here and never part of the virtualized/searchable
    // list.
    const hasNotSetOption = options.some(({ value }) => value === NOT_SET_VALUE)
    const realOptions = options.filter(({ value }) => value !== NOT_SET_VALUE)
    const anyValueActive = selected.includes(ANY_VALUE_KEY)

    // Toggling "Any value" always rebuilds the selection from scratch
    // rather than adding/removing just the one key - turning it on
    // collapses any individually-picked real values into the wildcard
    // (they're now redundant), and turning it off unticks every real
    // value along with it (there's nothing meaningful to "fall back" to).
    // "No value" is independent either way and carries over untouched.
    const onToggleAnyValue = () => {
        const keepNotSet = selected.includes(NOT_SET_VALUE)
        applyValues(getAnyValueToggleResult(anyValueActive, keepNotSet))
    }

    const invertibleValues = getInvertibleValues(hasNotSetOption, realOptions)

    // A real value's checkbox is ticked either because it's individually
    // selected, or because "Any value" is active (which stands for "every
    // real value" - "No value" is the one exception, handled on its own
    // below). Clicking one while "Any value" is active means "everything
    // except this one" - not "add this one on top of Any value" - so it
    // has to expand Any value into its concrete equivalent (every real
    // value but this one) rather than going through the plain toggle,
    // which would otherwise just add the clicked value to an array that
    // still has ANY_VALUE_KEY in it and leave every other checkbox ticked
    // for the wrong reason.
    const onToggleRealValue = (value) => {
        if (anyValueActive) {
            const next = realOptions
                .map((o) => o.value)
                .filter((v) => v !== value)
            applyValues(
                selected.includes(NOT_SET_VALUE)
                    ? [...next, NOT_SET_VALUE]
                    : next
            )
            return
        }

        const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value]

        // Checking every real value one by one ends up in the same place
        // as checking "Any value" directly - collapse to that instead of
        // leaving a literal array that happens to list them all, so the
        // two are always the same underlying state.
        const allRealValuesChecked =
            realOptions.length > 0 &&
            realOptions.every((o) => next.includes(o.value))
        applyValues(getRealValueToggleResult(next, allRealValuesChecked))
    }

    // Reverses every checkbox's *effective* ticked state, not just literal
    // array membership - while "Any value" is active every real value
    // reads as ticked (see onToggleRealValue above), so reversing has to
    // untick all of them (and "Any value" along with them, since there's
    // no way to represent "every real value unticked" while it's still
    // set) rather than leaving them all ticked and only toggling values
    // that were never literally in the array to begin with. "No value" is
    // unaffected by "Any value" and simply flips on its own.
    const onReverseSelection = () => {
        const invertedRealValues = anyValueActive
            ? []
            : realOptions
                  .map((o) => o.value)
                  .filter((v) => !selected.includes(v))
        const invertedNotSet =
            hasNotSetOption && !selected.includes(NOT_SET_VALUE)

        // Same rule as onToggleRealValue: ending up with every real value
        // ticked (e.g. reversing a selection of just "No value") is the
        // same state as "Any value" being active, so it collapses into
        // that rather than a literal array that happens to list them all.
        const allRealValuesInverted =
            !anyValueActive &&
            realOptions.length > 0 &&
            invertedRealValues.length === realOptions.length

        if (allRealValuesInverted) {
            applyValues(
                invertedNotSet
                    ? [ANY_VALUE_KEY, NOT_SET_VALUE]
                    : [ANY_VALUE_KEY]
            )
            return
        }

        applyValues(
            invertedNotSet
                ? [NOT_SET_VALUE, ...invertedRealValues]
                : invertedRealValues
        )
    }

    const trimmedSearch = searchText.trim()
    const normalizedSearch = trimmedSearch.toLowerCase()
    // Numeric columns narrow the list using the same comparison the typed
    // text would apply to the table's rows (>, <, ranges, ...), so what's
    // checked here always matches what "Use filter" would actually select -
    // a plain substring match wouldn't understand "> 100" against "150".
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

    // Applies (or clears) live as the user types - typing a value that
    // doesn't match an existing option filters the table immediately,
    // exactly like picking a checkbox already does, rather than waiting
    // for an explicit commit step. Clearing the text (including via the
    // input's own built-in clear button) clears whatever filter is active,
    // whether it's picked values or a typed one.
    const onSearchChange = ({ value }) => {
        // Numeric columns only ever match a numericFilter expression
        // (digits, comparison operators, & / ,) - letters could never
        // apply to a number column, so strip them as they're typed rather
        // than accepting them and silently matching nothing.
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

    // The checkbox list is virtualized, so scrolling the highlighted row
    // into view has to be requested explicitly rather than relying on the
    // browser's native scrollIntoView over an already-rendered DOM node.
    const scrollHighlightedIntoView = (index) => {
        const optionIndex = showCustomFilterRow ? index - 1 : index
        if (optionIndex >= 0 && optionIndex < filteredOptions.length) {
            listRef.current?.scrollToIndex({
                index: optionIndex,
                align: 'center',
            })
        }
    }

    // The custom-filter row (when shown) sits first, matching its visual
    // position above the checkbox list. It's usually already applied live
    // by this point (see onSearchChange) - toggling it again here is a
    // no-op.
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

    // Closed, this reads like the old trigger button ("3 selected", the
    // applied filter text, or empty so the "Search" placeholder shows).
    // Open, it's a live, editable search/filter field - the same input
    // serves both roles instead of a button revealing a separate one.
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
                                    label={resolveLabel(NOT_SET_VALUE)}
                                    checked={selected.includes(NOT_SET_VALUE)}
                                    onChange={() => toggleValue(NOT_SET_VALUE)}
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
                                    // Renders a couple of rows beyond the
                                    // container's own visible height, so
                                    // when the list is capped there's
                                    // always a (clipped) row peeking in at
                                    // the bottom as a "scroll for more" cue,
                                    // rather than blank space below the
                                    // last row Virtuoso would otherwise
                                    // bother mounting.
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
                                                dataKey === 'id' &&
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

// Plain categorical columns (legend, type, and every other column discovered
// generically by useTableData): raw value IS the display label, except for
// the NOT_SET_VALUE sentinel representing blank/missing cells.
const PlainSearchableFilter = (props) => (
    <SearchableFilterPopover
        {...props}
        resolveLabel={(value) =>
            value === NOT_SET_VALUE ? i18n.t('No value') : value
        }
    />
)

// Option-set-backed event columns: translate stored code -> display name.
// useOptionSet/useDataQuery is only ever mounted here, never for other
// columns, since those never have an optionSetId. The custom-filter row is
// disabled here: filterData matches the raw stored code, not the resolved
// name the user sees, so free text typed against the visible label couldn't
// be applied correctly - and since option sets are a closed, fully
// enumerable set already covered by the checkbox list, there's no real gap
// left for free text to fill.
const OptionSetSearchableFilter = ({ optionSetId, ...props }) => {
    const { optionSet } = useOptionSet(optionSetId)
    const resolveLabel = (value) =>
        value === NOT_SET_VALUE
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

// Every column (aside from the checkbox/selection column, which has its own
// SelectionFilterButton in DataTable.jsx) gets the same searchable popover,
// even ones with no known distinct values (over the cap, or not yet loaded)
// - they just render with an empty options list, which still lets the
// custom-filter row work exactly as it always has.
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
