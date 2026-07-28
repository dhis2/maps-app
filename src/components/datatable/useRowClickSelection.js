import { useCallback, useRef } from 'react'
import { getRowClickAction, getRowId } from '../../util/dataTable.js'

// Shared row-click-to-selection-action handling: shift-click ranges, ctrl/cmd
// toggles a single row. onToggle/onSelectRange apply the result however the
// caller's selection state actually works (Redux for a single layer, local
// state for Combined's cross-layer selection).
export const useRowClickSelection = ({ rows, onToggle, onSelectRange }) => {
    const lastClickedRowIndexRef = useRef(null)

    return useCallback(
        (row, event) => {
            const id = getRowId(row)

            if (!id || !rows) {
                return
            }

            const rowIndex = rows.findIndex((r) => getRowId(r) === id)
            const action = getRowClickAction(event, {
                id,
                rowIndex,
                rows,
                lastClickedRowIndex: lastClickedRowIndexRef.current,
            })

            if (!action) {
                return
            }

            if (action.type === 'range') {
                onSelectRange(action.ids)
            } else {
                onToggle(action.id)
            }
            lastClickedRowIndexRef.current = rowIndex
        },
        [rows, onToggle, onSelectRange]
    )
}
