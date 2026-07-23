import i18n from '@dhis2/d2-i18n'
import { TYPE_NUMBER } from '../constants/dataTable.js'
import { numericFilter } from './filter.js'

const POPOVER_ROW_NON_LABEL_WIDTH = 56
const MIN_POPOVER_WIDTH = 140
const MAX_POPOVER_WIDTH = 280

export const getSelectedAndAppliedString = (filterValue) => ({
    selected: Array.isArray(filterValue) ? filterValue : [],
    appliedString: typeof filterValue === 'string' ? filterValue : '',
})

export const getDisplayValue = ({
    isOpen,
    searchText,
    selected,
    appliedString,
}) => {
    if (isOpen) {
        return searchText
    }
    if (selected.length) {
        return i18n.t('{{count}} selected', { count: selected.length })
    }
    return appliedString
}

export const getFilteredOptions = ({
    realOptions,
    trimmedSearch,
    normalizedSearch,
    type,
    resolveLabel,
}) => {
    if (!trimmedSearch) {
        return realOptions
    }
    if (type === TYPE_NUMBER) {
        return realOptions.filter(({ value }) =>
            numericFilter(Number(value), trimmedSearch)
        )
    }
    return realOptions.filter(({ value }) =>
        resolveLabel(value).toLowerCase().includes(normalizedSearch)
    )
}

let measureCanvasContext = null
export const measureMaxTextWidth = (texts, font) => {
    if (!measureCanvasContext) {
        measureCanvasContext = document.createElement('canvas').getContext('2d')
    }
    measureCanvasContext.font = font
    return texts.reduce(
        (max, text) =>
            Math.max(max, measureCanvasContext.measureText(text).width),
        0
    )
}

export const getPopoverWidth = (maxLabelWidth) =>
    Math.min(
        Math.max(
            maxLabelWidth + POPOVER_ROW_NON_LABEL_WIDTH,
            MIN_POPOVER_WIDTH
        ),
        MAX_POPOVER_WIDTH
    )

export const hasMatchingOptionLabel = (options, resolveLabel, normalizedText) =>
    options.some(
        ({ value }) => resolveLabel(value).toLowerCase() === normalizedText
    )

export const getCyclicIndex = (current, total, delta) =>
    total ? (current + delta + total) % total : -1

export const toOptionIndex = (highlightedIndex, showCustomFilterRow) =>
    showCustomFilterRow ? highlightedIndex - 1 : highlightedIndex

export const toHighlightedIndex = (optionIndex, showCustomFilterRow) =>
    showCustomFilterRow ? optionIndex + 1 : optionIndex
