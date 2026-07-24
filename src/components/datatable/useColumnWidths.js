import { useEffect, useRef, useState } from 'react'

const MIN_COLUMN_WIDTH = 100

export const useColumnWidths = ({ availableWidth, headers, error }) => {
    const headerRowRef = useRef(null)
    const minColumnWidthsRef = useRef([])
    const [columnWidths, setColumnWidths] = useState([])

    useEffect(() => {
        // Measure column widths in auto layout, then switch to fixed to prevent content shift during virtual scrolling
        if (columnWidths.length === 0 && headerRowRef.current) {
            const frameId = requestAnimationFrame(() => {
                if (!headerRowRef.current) {
                    return
                }

                const measuredColumnWidths = []

                const dataCells = Array.from(headerRowRef.current.cells).slice(
                    1
                )

                for (const cell of dataCells) {
                    const rect = cell.getBoundingClientRect()
                    measuredColumnWidths.push(
                        Math.max(MIN_COLUMN_WIDTH, Math.floor(rect.width))
                    )
                }

                minColumnWidthsRef.current = measuredColumnWidths
                setColumnWidths(measuredColumnWidths)
            })

            return () => cancelAnimationFrame(frameId)
        }
    }, [columnWidths])

    useEffect(() => {
        // Reset to auto layout for re-measurement when headers change
        if (!error) {
            minColumnWidthsRef.current = []
            setColumnWidths([])
        }
    }, [headers, error])

    useEffect(() => {
        // Scale column widths proportionally on resize, clamped to initial measured widths
        if (!error) {
            setColumnWidths((prev) => {
                if (prev.length === 0) {
                    return prev
                }
                const prevTotal = prev.reduce((sum, w) => sum + w, 0)
                if (prevTotal === 0 || availableWidth === 0) {
                    return []
                }
                const minWidths = minColumnWidthsRef.current
                return prev.map((w, i) =>
                    Math.max(
                        minWidths[i] ?? 0,
                        Math.round((w / prevTotal) * availableWidth)
                    )
                )
            })
        }
    }, [availableWidth, error])

    return { headerRowRef, columnWidths }
}
