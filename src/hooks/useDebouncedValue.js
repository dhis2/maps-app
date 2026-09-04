import { useEffect, useState } from 'react'

const DEFAULT_DEBOUNCE_MS = 300

// Returns a copy of `value` that only updates after it stops changing for
// `debounceMs`, so callers don't recompute on every keystroke
const useDebouncedValue = (value, debounceMs = DEFAULT_DEBOUNCE_MS) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeoutId = setTimeout(() => setDebouncedValue(value), debounceMs)
        return () => clearTimeout(timeoutId)
    }, [value, debounceMs])

    return debouncedValue
}

export default useDebouncedValue
