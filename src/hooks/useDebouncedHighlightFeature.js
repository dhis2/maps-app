import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_HOVER_LEAVE_DEBOUNCE_MS = 100

// Debounces the "clear" side of a highlightFeature dispatcher
// socontinuous mouse movement doesn't flash the highlight
const useDebouncedHighlightFeature = (
    setFeature,
    debounceMs = DEFAULT_HOVER_LEAVE_DEBOUNCE_MS
) => {
    const hoverLeaveTimeoutRef = useRef(null)

    const debouncedHighlightFeature = useCallback(
        (payload) => {
            if (hoverLeaveTimeoutRef.current) {
                clearTimeout(hoverLeaveTimeoutRef.current)
                hoverLeaveTimeoutRef.current = null
            }

            if (payload) {
                setFeature(payload)
                return
            }

            hoverLeaveTimeoutRef.current = setTimeout(() => {
                hoverLeaveTimeoutRef.current = null
                setFeature(null)
            }, debounceMs)
        },
        [setFeature, debounceMs]
    )

    useEffect(
        () => () => {
            if (hoverLeaveTimeoutRef.current) {
                clearTimeout(hoverLeaveTimeoutRef.current)
            }
        },
        []
    )

    return debouncedHighlightFeature
}

export default useDebouncedHighlightFeature
