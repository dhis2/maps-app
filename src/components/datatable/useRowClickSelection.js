import { useCallback, useRef } from 'react'
import { getRowClickAction, getRowId } from '../../util/dataTable.js'

export const useRowClickSelection = ({
    rows,
    onToggle,
    onSelectRange,
    selectedIdSet,
}) => {
    const lastClickedRowIndexRef = useRef(null)

    const resetAnchor = useCallback(() => {
        lastClickedRowIndexRef.current = null
    }, [])

    const toggleWithAnchor = useCallback(
        (id, rowIndex) => {
            const isDeselecting = selectedIdSet?.has(id)
            onToggle(id)
            lastClickedRowIndexRef.current = isDeselecting ? null : rowIndex
        },
        [onToggle, selectedIdSet]
    )

    const selectRangeWithAnchor = useCallback(
        (ids, rowIndex, hadAnchor) => {
            onSelectRange(ids)
            if (!hadAnchor) {
                lastClickedRowIndexRef.current = rowIndex
            }
        },
        [onSelectRange]
    )

    const onRowClick = useCallback(
        (row, event) => {
            const id = getRowId(row)

            if (!id || !rows) {
                return
            }

            const rowIndex = rows.findIndex((r) => getRowId(r) === id)
            const hadAnchor = lastClickedRowIndexRef.current !== null
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
                selectRangeWithAnchor(action.ids, rowIndex, hadAnchor)
            } else {
                toggleWithAnchor(action.id, rowIndex)
            }
        },
        [rows, selectRangeWithAnchor, toggleWithAnchor]
    )

    const onCheckboxToggle = useCallback(
        (id, event) => {
            if (!id || !rows) {
                return
            }

            const rowIndex = rows.findIndex((r) => getRowId(r) === id)

            if (event?.shiftKey) {
                const hadAnchor = lastClickedRowIndexRef.current !== null
                const action = getRowClickAction(event, {
                    id,
                    rowIndex,
                    rows,
                    lastClickedRowIndex: lastClickedRowIndexRef.current,
                })
                selectRangeWithAnchor(action.ids, rowIndex, hadAnchor)
                return
            }

            toggleWithAnchor(id, rowIndex)
        },
        [rows, selectRangeWithAnchor, toggleWithAnchor]
    )

    return { onRowClick, onCheckboxToggle, resetAnchor }
}
