import { arrayMoveImmutable } from 'array-move'
import { SENTINEL_NO_VALUE, TYPE_NUMBER } from '../constants/dataTable.js'

export const getDefaultVisibleKeys = (headers) =>
    headers.filter((h) => !h.defaultHidden).map((h) => h.dataKey)

export const getOrderedHeaders = (headers, config) => {
    if (!headers) {
        return headers
    }

    const { orderedKeys } = config ?? {}

    let result = headers
    if (orderedKeys) {
        const orderIndex = new Map(orderedKeys.map((key, i) => [key, i]))
        const getOrderIndex = (dataKey) =>
            orderIndex.get(dataKey) ?? orderedKeys.length
        result = [...headers].sort(
            (a, b) => getOrderIndex(a.dataKey) - getOrderIndex(b.dataKey)
        )
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

export const toggleVisibleKey = (visibleKeys, dataKey, checked) =>
    checked
        ? [...visibleKeys, dataKey]
        : visibleKeys.filter((k) => k !== dataKey)

export const reverseVisibleKeys = (headers, visibleKeys) =>
    headers
        .filter((h) => !visibleKeys.includes(h.dataKey))
        .map((h) => h.dataKey)

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
            value:
                type === TYPE_NUMBER && Number.isNaN(Number(value))
                    ? null
                    : value,
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
