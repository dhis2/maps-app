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
