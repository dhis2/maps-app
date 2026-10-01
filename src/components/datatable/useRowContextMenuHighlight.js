import { useCallback, useRef } from 'react'
import { shouldClearFeatureHighlight } from '../../util/dataTable.js'

export const useRowContextMenuHighlight = ({ onPin, onClear }) => {
    const menuOpenRef = useRef(false)

    const onContextMenuOpen = useCallback(
        (row) => {
            menuOpenRef.current = true
            onPin(row)
        },
        [onPin]
    )

    const guardedClear = useCallback(
        (event) => {
            if (menuOpenRef.current) {
                return
            }
            if (shouldClearFeatureHighlight(event)) {
                onClear()
            }
        },
        [onClear]
    )

    const onMenuClose = useCallback(
        (highlightChanged) => {
            menuOpenRef.current = false
            if (!highlightChanged) {
                onClear()
            }
        },
        [onClear]
    )

    return { onContextMenuOpen, guardedClear, onMenuClose }
}
