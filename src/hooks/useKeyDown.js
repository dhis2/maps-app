import { useEffect, useRef, useMemo } from 'react'

const useKeyDown = (key, callback, longPress = false) => {
    const timerRef = useRef(null)

    const keys = useMemo(() => (Array.isArray(key) ? key : [key]), [key])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (keys.includes(event.key)) {
                if (!longPress) {
                    callback(event)
                } else {
                    timerRef.current = setTimeout(() => {
                        callback(event)
                    }, 250) // Adjust delay for long press detection
                }
            }
        }

        const handleKeyUp = (event) => {
            if (keys.includes(event.key) && longPress) {
                clearTimeout(timerRef.current)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [keys, callback, longPress])

    useEffect(() => {
        return () => clearTimeout(timerRef.current)
    }, [])
}

export default useKeyDown
