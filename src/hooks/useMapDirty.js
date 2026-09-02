import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { isMapDirty } from '../util/mapDirty.js'

const DEBOUNCE_MS = 300

export const useMapDirty = () => {
    const map = useSelector((state) => state.map)
    const savedMap = useSelector((state) => state.savedMap)
    const [dirty, setDirty] = useState(false)
    const timeoutRef = useRef()

    useEffect(() => {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(
            () => setDirty(isMapDirty(map, savedMap)),
            DEBOUNCE_MS
        )
        return () => clearTimeout(timeoutRef.current)
    }, [map, savedMap])

    return dirty
}
