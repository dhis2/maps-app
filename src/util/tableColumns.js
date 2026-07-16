const CHECKBOX_COLUMN_WIDTH = 76

const getOrderIndex = (dataKey, orderedKeys) => {
    const index = orderedKeys.indexOf(dataKey)
    return index === -1 ? orderedKeys.length : index
}

// Computes the headers actually shown, in display order, from the full
// header list and a saved dataTableColumnConfig. Handles headers whose
// dataKey no longer exists (harmlessly dropped, since this always starts
// from the current `headers`) and headers that exist but were never part
// of a saved config (kept visible, ordered last).
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

    // visibleKeys is only set once a user has actually configured columns -
    // before that, columnConfig is null and every header shows. Once set,
    // it's the definitive "on" list: a dataKey added later (e.g. a new EE
    // band) that was never part of that saved list stays hidden until the
    // user explicitly turns it on, rather than reappearing unexpectedly.
    if (visibleKeys) {
        result = result.filter((h) => visibleKeys.includes(h.dataKey))
    }

    if (pinnedKeys.length) {
        // position: sticky only freezes columns that are actually
        // contiguous at the start of display order, so pinned columns
        // must be moved to the front here, not just flagged for styling.
        const pinned = result.filter((h) => pinnedKeys.includes(h.dataKey))
        const rest = result.filter((h) => !pinnedKeys.includes(h.dataKey))
        result = [...pinned, ...rest]
    }

    return result
}

// Left offset (px) for each pinned column's sticky positioning, keyed by
// dataKey. `visibleHeaders`/`columnWidths` must be in the same display
// order (i.e. already passed through getVisibleHeaders).
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
