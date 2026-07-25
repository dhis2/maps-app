import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    DATE_GROUPS_GRANULARITY,
} from '../../constants/dataTable.js'
import {
    buildDateGroupTree,
    flattenVisibleNodes,
    formatNodeLabel,
    getNodeCheckState,
    getSearchMatches,
    nodeMatchesOrHasMatch,
    toggleDateGroupPrefix,
} from '../../util/dateGroups.js'
import { isDateGroupFilter } from '../../util/filter.js'
import {
    getCyclicIndex,
    getDisplayValue,
    toOptionIndex,
} from '../../util/filterInput.js'
import { toggleAnyValue } from '../../util/filterSelection.js'
import { getDropdownPlacement } from './FilterDropdownPopover.jsx'
import GroupFilterPopover from './GroupFilterPopover.jsx'

const HELP_CONTENT = (
    <div>
        <div>{i18n.t('Select a year, month, day or hour')}</div>
        <div>{i18n.t('to match the events under it, or type to search')}</div>
    </div>
)
const DATE_INPUT_DISALLOWED = /[^0-9\-:. T]/g

const DateGroupFilterInput = ({
    dataKey,
    name,
    layerId,
    filterValue,
    options,
    type,
}) => {
    const dispatch = useDispatch()
    const anchorRef = useRef(null)
    const listRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [expandedKeys, setExpandedKeys] = useState(() => new Set())
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const selectedPrefixes = isDateGroupFilter(filterValue)
        ? filterValue.prefixes
        : []
    const appliedString = typeof filterValue === 'string' ? filterValue : ''
    const anyValueActive = selectedPrefixes.includes(SENTINEL_ANY_VALUE)
    const notSetActive = selectedPrefixes.includes(SENTINEL_NO_VALUE)
    const treePrefixes = selectedPrefixes.filter(
        (p) => p !== SENTINEL_ANY_VALUE && p !== SENTINEL_NO_VALUE
    )
    const hasActiveFilter = selectedPrefixes.length > 0 || appliedString !== ''

    const openPopover = () => {
        setSearchText(appliedString)
        setHighlightedIndex(-1)
        setIsOpen(true)
    }
    const closePopover = () => setIsOpen(false)

    const anchorRect = anchorRef.current?.getBoundingClientRect()
    const { dropdownPlacement, dropdownSide, tooltipPlacement } =
        getDropdownPlacement(anchorRect)

    const applyValues = useCallback(
        (nextPrefixes) =>
            nextPrefixes.length
                ? dispatch(
                      setDataFilter(layerId, dataKey, {
                          granularity: DATE_GROUPS_GRANULARITY,
                          prefixes: nextPrefixes,
                      })
                  )
                : dispatch(clearDataFilter(layerId, dataKey)),
        [dispatch, layerId, dataKey]
    )

    const hasNotSetOption = options.some(
        ({ value }) => value === SENTINEL_NO_VALUE
    )
    const realValues = useMemo(
        () =>
            options
                .filter(({ value }) => value !== SENTINEL_NO_VALUE)
                .map((o) => o.value),
        [options]
    )

    const tree = useMemo(
        () => buildDateGroupTree(realValues, type),
        [realValues, type]
    )

    const normalizedSearch = searchText.trim().toLowerCase()
    const searchMatches = useMemo(
        () =>
            normalizedSearch ? getSearchMatches(tree, normalizedSearch) : null,
        [tree, normalizedSearch]
    )
    const effectiveExpanded = useMemo(
        () =>
            searchMatches
                ? new Set([
                      ...expandedKeys,
                      ...searchMatches.expandedAncestorKeys,
                  ])
                : expandedKeys,
        [expandedKeys, searchMatches]
    )

    const visibleNodes = useMemo(() => {
        const flattened = flattenVisibleNodes(tree, effectiveExpanded)
        if (!searchMatches) {
            return flattened
        }
        return flattened.filter(({ node }) =>
            nodeMatchesOrHasMatch(node, searchMatches.matchedKeys)
        )
    }, [tree, effectiveExpanded, searchMatches])

    const showCustomFilterRow = normalizedSearch !== ''
    const totalCount = visibleNodes.length + (showCustomFilterRow ? 1 : 0)

    const onToggleExpand = (key) =>
        setExpandedKeys((prev) => {
            const next = new Set(prev)
            if (next.has(key)) {
                next.delete(key)
            } else {
                next.add(key)
            }
            return next
        })

    const checkStateFor = (node) =>
        anyValueActive ? 'checked' : getNodeCheckState(node, treePrefixes)

    const onToggleNode = (node) => {
        if (anyValueActive) {
            return
        }
        const nextTreePrefixes = toggleDateGroupPrefix(treePrefixes, node)
        applyValues(
            notSetActive
                ? [...nextTreePrefixes, SENTINEL_NO_VALUE]
                : nextTreePrefixes
        )
    }

    const onToggleAnyValue = () => applyValues(toggleAnyValue(selectedPrefixes))

    const onToggleNotSet = () =>
        applyValues(
            notSetActive
                ? selectedPrefixes.filter((p) => p !== SENTINEL_NO_VALUE)
                : [...selectedPrefixes, SENTINEL_NO_VALUE]
        )

    const applyCustomFilter = (text) =>
        text
            ? dispatch(setDataFilter(layerId, dataKey, text))
            : dispatch(clearDataFilter(layerId, dataKey))

    const onSearchChange = ({ value }) => {
        const sanitized = value.replace(DATE_INPUT_DISALLOWED, '')
        setSearchText(sanitized)
        setHighlightedIndex(-1)

        const trimmed = sanitized.trim()
        if (trimmed === '') {
            if (hasActiveFilter) {
                dispatch(clearDataFilter(layerId, dataKey))
            }
            return
        }

        applyCustomFilter(trimmed)
    }

    const scrollHighlightedIntoView = (index) => {
        const optionIndex = toOptionIndex(index, showCustomFilterRow)
        if (optionIndex >= 0 && optionIndex < visibleNodes.length) {
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
        if (optionIndex >= 0 && optionIndex < visibleNodes.length) {
            onToggleNode(visibleNodes[optionIndex].node)
        }
    }

    const onSearchKeyDown = (_, event) => {
        const optionIndex = toOptionIndex(highlightedIndex, showCustomFilterRow)
        const { node } = visibleNodes[optionIndex] ?? {}
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
            case 'ArrowRight':
                if (node?.children.length && !effectiveExpanded.has(node.key)) {
                    event.preventDefault()
                    onToggleExpand(node.key)
                }
                break
            case 'ArrowLeft':
                if (node?.children.length && effectiveExpanded.has(node.key)) {
                    event.preventDefault()
                    onToggleExpand(node.key)
                }
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
        selected: selectedPrefixes,
        appliedString,
    })

    return (
        <GroupFilterPopover
            name={name}
            helpContent={HELP_CONTENT}
            customFilterTag={i18n.t('Contains')}
            formatLabel={(node) => formatNodeLabel(node, i18n.language)}
            anchorRef={anchorRef}
            listRef={listRef}
            dropdownPlacement={dropdownPlacement}
            dropdownSide={dropdownSide}
            tooltipPlacement={tooltipPlacement}
            isOpen={isOpen}
            searchText={searchText}
            highlightedIndex={highlightedIndex}
            displayValue={displayValue}
            visibleNodes={visibleNodes}
            showCustomFilterRow={showCustomFilterRow}
            anyValueActive={anyValueActive}
            notSetActive={notSetActive}
            hasNotSetOption={hasNotSetOption}
            effectiveExpanded={effectiveExpanded}
            checkStateFor={checkStateFor}
            openPopover={openPopover}
            closePopover={closePopover}
            onSearchChange={onSearchChange}
            onSearchKeyDown={onSearchKeyDown}
            onApplyCustomFilterClick={() => {
                applyCustomFilter(searchText.trim())
                closePopover()
            }}
            onToggleExpand={onToggleExpand}
            onToggleNode={onToggleNode}
            onToggleAnyValue={onToggleAnyValue}
            onToggleNotSet={onToggleNotSet}
        />
    )
}

DateGroupFilterInput.propTypes = {
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string }))
        .isRequired,
    type: PropTypes.string.isRequired,
    filterValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.object,
    ]),
    layerId: PropTypes.string,
}

export default DateGroupFilterInput
