import { arrayMoveImmutable } from 'array-move'
import { SENTINEL_NO_VALUE, TYPE_NUMBER } from '../constants/dataTable.js'

const CHECKBOX_COLUMN_WIDTH = 76

export const getDefaultVisibleKeys = (headers) =>
    headers.filter((h) => !h.defaultHidden).map((h) => h.dataKey)

export const getOrderedHeaders = (headers, config) => {
    if (!headers) {
        return headers
    }

    const { orderedKeys, pinnedKeys } = config ?? {}

    let result = headers
    if (orderedKeys) {
        const orderIndex = new Map(orderedKeys.map((key, i) => [key, i]))
        const getOrderIndex = (dataKey) =>
            orderIndex.get(dataKey) ?? orderedKeys.length
        result = [...headers].sort(
            (a, b) => getOrderIndex(a.dataKey) - getOrderIndex(b.dataKey)
        )
    }

    if (pinnedKeys?.length) {
        const pinned = result.filter((h) => pinnedKeys.includes(h.dataKey))
        const rest = result.filter((h) => !pinnedKeys.includes(h.dataKey))
        result = [...pinned, ...rest]
    }

    return result
}

export const getVisibleHeaders = (headers, columnConfig) => {
    if (!headers) {
        return headers
    }

    const visibleKeys =
        columnConfig?.visibleKeys ?? getDefaultVisibleKeys(headers)

    return getOrderedHeaders(headers, columnConfig).filter((h) =>
        visibleKeys.includes(h.dataKey)
    )
}

export const getPinnedCount = (orderedHeaders, pinnedKeys) => {
    if (!orderedHeaders?.length || !pinnedKeys?.length) {
        return 0
    }
    let count = 0
    for (const header of orderedHeaders) {
        if (!pinnedKeys.includes(header.dataKey)) {
            break
        }
        count++
    }
    return count
}

export const isPinnedGroupEnd = (header, pinnedCount, orderedHeaders) =>
    pinnedCount > 0 &&
    pinnedCount < orderedHeaders.length &&
    header.dataKey === orderedHeaders[pinnedCount - 1].dataKey

export const toggleVisibleKey = (visibleKeys, dataKey, checked) =>
    checked
        ? [...visibleKeys, dataKey]
        : visibleKeys.filter((k) => k !== dataKey)

export const togglePinnedKey = (pinnedKeys, dataKey) =>
    pinnedKeys.includes(dataKey)
        ? pinnedKeys.filter((k) => k !== dataKey)
        : [...pinnedKeys, dataKey]

export const reverseVisibleKeys = (headers, visibleKeys) =>
    headers
        .filter((h) => !visibleKeys.includes(h.dataKey))
        .map((h) => h.dataKey)

// @dhis2/ui requires `width` whenever `fixed` is passed
export const getPinnedCellProps = (
    dataKey,
    index,
    { pinnedLeftOffsets, pinnedColumnCount, columnWidths }
) => {
    const leftOffset = pinnedLeftOffsets[dataKey]
    const isPinned = index < pinnedColumnCount && leftOffset !== undefined
    return {
        fixed: isPinned,
        left: isPinned ? `${leftOffset}px` : undefined,
        width: isPinned ? `${columnWidths[index] ?? 0}px` : undefined,
        isLastPinned: index === pinnedColumnCount - 1,
    }
}

export const getPinnedLeftOffsets = (
    visibleHeaders,
    pinnedKeys,
    columnWidths
) => {
    const offsets = {}
    if (!pinnedKeys?.length || !columnWidths?.length) {
        return offsets
    }

    let offset = CHECKBOX_COLUMN_WIDTH
    visibleHeaders.forEach((header, index) => {
        if (pinnedKeys.includes(header.dataKey)) {
            offsets[header.dataKey] = offset
            offset += columnWidths[index] ?? 0
        }
    })
    return offsets
}

// Expensive: scans every row once per column
export const getColumnDistinctValues = (headers, data) => {
    if (!headers?.length || !data?.length) {
        return null
    }

    const result = {}
    headers.forEach(({ dataKey, type }) => {
        const seen = new Set()
        for (const item of data) {
            const val = item[dataKey]
            seen.add(
                val === undefined || val === null || val === SENTINEL_NO_VALUE
                    ? SENTINEL_NO_VALUE
                    : String(val)
            )
        }

        if (seen.size > 0) {
            result[dataKey] = { values: Array.from(seen), type }
        }
    })

    return result
}

export const buildRowCells = (item, headers) =>
    headers.map(({ dataKey, roundFn, type }) => {
        const value = roundFn ? roundFn(item[dataKey]) : item[dataKey]
        return {
            dataKey,
            value: type === TYPE_NUMBER && isNaN(value) ? null : value,
            align: type === TYPE_NUMBER ? 'right' : 'left',
            itemId: item.id,
        }
    })

export const filterHeadersByName = (headers, search) => {
    const normalizedSearch = search.trim().toLowerCase()
    return headers.filter((h) =>
        h.name.toLowerCase().includes(normalizedSearch)
    )
}

export const reorderHeaderKeys = (
    orderedHeaders,
    activeDataKey,
    overDataKey
) => {
    const oldIndex = orderedHeaders.findIndex(
        (h) => h.dataKey === activeDataKey
    )
    const newIndex = orderedHeaders.findIndex((h) => h.dataKey === overDataKey)

    if (oldIndex === -1 || newIndex === -1) {
        return null
    }

    return arrayMoveImmutable(orderedHeaders, oldIndex, newIndex).map(
        (h) => h.dataKey
    )
}
