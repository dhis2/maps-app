import { useEffect, useRef } from 'react'

const useKeyDown = (key, callback, longPress = false) => {
    const timerRef = useRef(null)

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === key) {
                if (!longPress) {
                    callback(event)
                } else {
                    // Start a timer for detecting long press
                    timerRef.current = setTimeout(() => {
                        callback(event)
                    }, 250) // Adjust delay for long press detection
                }
            }
        }

        const handleKeyUp = (event) => {
            if (event.key === key && longPress) {
                // Clear the timer if the key is released before the delay
                clearTimeout(timerRef.current)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [key, callback, longPress])

    useEffect(() => {
        // Cleanup on unmount
        return () => clearTimeout(timerRef.current)
    }, [])
}

export default useKeyDown
