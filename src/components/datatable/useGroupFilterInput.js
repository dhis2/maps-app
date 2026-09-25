import { useCallback, useMemo, useRef, useState } from 'react'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
} from '../../constants/dataTable.js'
import {
    getCyclicIndex,
    getDisplayValue,
    toOptionIndex,
} from '../../util/filterInput.js'
import { toggleAnyValue } from '../../util/filterSelection.js'
import {
    flattenVisibleNodes,
    getNodeCheckState,
    nodeMatchesOrHasMatch,
    togglePrefix,
} from '../../util/prefixTree.js'
import { getDropdownPlacement } from './FilterDropdownPopover.jsx'

const identity = (value) => value

const useGroupFilterInput = ({
    onChange,
    onClear,
    filterValue,
    options,
    granularity,
    buildTree,
    getMatches,
    parseFilterValue,
    commitSearch,
    sanitizeInput = identity,
}) => {
    const anchorRef = useRef(null)
    const listRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [expandedKeys, setExpandedKeys] = useState(() => new Set())
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const { selectedPrefixes, appliedString } = parseFilterValue(filterValue)
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
                ? onChange({ granularity, prefixes: nextPrefixes })
                : onClear(),
        [onChange, onClear, granularity]
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

    const tree = useMemo(() => buildTree(realValues), [buildTree, realValues])

    const normalizedSearch = searchText.trim().toLowerCase()
    const searchMatches = useMemo(
        () => (normalizedSearch ? getMatches(tree, normalizedSearch) : null),
        [tree, normalizedSearch, getMatches]
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
        const nextTreePrefixes = togglePrefix(treePrefixes, node)
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

    const applyCustomFilter = (text) => {
        if (!text) {
            onClear()
            return
        }
        commitSearch(text, { tree, onChange })
    }

    const onSearchChange = ({ value }) => {
        const sanitized = sanitizeInput(value)
        setSearchText(sanitized)
        setHighlightedIndex(-1)

        const trimmed = sanitized.trim()
        if (trimmed === '') {
            if (hasActiveFilter) {
                onClear()
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

    return {
        anchorRef,
        listRef,
        dropdownPlacement,
        dropdownSide,
        tooltipPlacement,
        isOpen,
        searchText,
        highlightedIndex,
        displayValue,
        visibleNodes,
        showCustomFilterRow,
        anyValueActive,
        notSetActive,
        hasNotSetOption,
        effectiveExpanded,
        checkStateFor,
        openPopover,
        closePopover,
        onSearchChange,
        onSearchKeyDown,
        onApplyCustomFilterClick: () => {
            applyCustomFilter(searchText.trim())
            closePopover()
        },
        onToggleExpand,
        onToggleNode,
        onToggleAnyValue,
        onToggleNotSet,
    }
}

export default useGroupFilterInput
