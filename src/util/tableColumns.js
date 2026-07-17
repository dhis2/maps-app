const CHECKBOX_COLUMN_WIDTH = 76

const getOrderIndex = (dataKey, orderedKeys) => {
    const index = orderedKeys.indexOf(dataKey)
    return index === -1 ? orderedKeys.length : index
}

export const getVisibleHeaders = (headers, columnConfig) => {
    if (!headers) {
        return headers
    }

    const { visibleKeys, orderedKeys } = columnConfig ?? {}
    const pinnedKeys = columnConfig?.pinnedKeys ?? []

    let result = orderedKeys
        ? [...headers].sort(
              (a, b) =>
                  getOrderIndex(a.dataKey, orderedKeys) -
                  getOrderIndex(b.dataKey, orderedKeys)
          )
        : headers

    if (visibleKeys) {
        result = result.filter((h) => visibleKeys.includes(h.dataKey))
    }

    if (pinnedKeys.length) {
        const pinned = result.filter((h) => pinnedKeys.includes(h.dataKey))
        const rest = result.filter((h) => !pinnedKeys.includes(h.dataKey))
        result = [...pinned, ...rest]
    }

    return result
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

export const togglePeriodId = (extraPeriodIds, periodId) =>
    extraPeriodIds.includes(periodId)
        ? extraPeriodIds.filter((id) => id !== periodId)
        : [...extraPeriodIds, periodId]

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
