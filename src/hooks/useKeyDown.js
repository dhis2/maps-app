import { useEffect, useRef, useMemo, useCallback } from 'react'

const useKeyDown = (key, callback, longPress = false) => {
    const timerRef = useRef(null)
    const keys = useMemo(() => (Array.isArray(key) ? key : [key]), [key])

    const handleKeyDown = useCallback(
        (event) => {
            if (keys.includes(event.key)) {
                if (longPress) {
                    timerRef.current = setTimeout(() => callback(event), 250)
                } else {
                    callback(event)
                }
            }
        },
        [keys, callback, longPress]
    )

    const handleKeyUp = useCallback(
        (event) => {
            if (keys.includes(event.key) && longPress) {
                clearTimeout(timerRef.current)
            }
        },
        [keys, longPress]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [handleKeyDown, handleKeyUp])
}

export default useKeyDown
