import i18n from '@dhis2/d2-i18n'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import history from '../util/history.js'
import { isMapDirty } from '../util/mapDirty.js'

export const useUnsavedChangesGuard = (loadLocation) => {
    const mapRef = useRef()
    mapRef.current = useSelector((state) => state.map)
    const savedMapRef = useRef()
    savedMapRef.current = useSelector((state) => state.savedMap)

    const [locationToConfirm, setLocationToConfirm] = useState(null)

    const isDirtyNow = useCallback(
        () => isMapDirty(mapRef.current, savedMapRef.current),
        []
    )

    useEffect(() => {
        const onBeforeUnload = (event) => {
            if (isDirtyNow()) {
                event.preventDefault()
                // Required for triggering the unload confirmation dialog
                // See: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
                event.returnValue = i18n.t('You have unsaved changes.')
            }
        }

        window.addEventListener('beforeunload', onBeforeUnload)
        return () => window.removeEventListener('beforeunload', onBeforeUnload)
    }, [isDirtyNow])

    const confirmLeave = useCallback(() => {
        if (locationToConfirm) {
            loadLocation(locationToConfirm)
            setLocationToConfirm(null)
        }
    }, [locationToConfirm, loadLocation])

    const cancelLeave = useCallback(() => {
        setLocationToConfirm(null)
        history.back()
    }, [])

    return {
        locationToConfirm,
        setLocationToConfirm,
        isDirtyNow,
        confirmLeave,
        cancelLeave,
    }
}
