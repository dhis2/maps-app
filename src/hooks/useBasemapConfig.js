import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSystemSettings } from '../components/SystemSettingsProvider.js'
import { getFallbackBasemap } from '../constants/basemaps.js'
import { defaultBasemapState } from '../reducers/map.js'

const emptyBasemap = { config: {} }

function useBasemapConfig(selected) {
    const [basemap, setBasemap] = useState(emptyBasemap)
    const basemaps = useSelector((state) => state.basemaps)
    const { keyDefaultBaseMap } = useSystemSettings()

    useEffect(() => {
        const selectedId = selected.id || keyDefaultBaseMap

        const basemapToUse =
            basemaps.find(({ id }) => id === selectedId) || getFallbackBasemap()

        // Make sure we don't override the basemap opacity
        if (basemapToUse && selected.opacity !== undefined) {
            delete basemapToUse.opacity
        }

        const basemapConfig = {
            ...defaultBasemapState,
            ...selected,
            ...basemapToUse,
        }

        setBasemap(basemapConfig)
    }, [keyDefaultBaseMap, selected, basemaps])

    return basemap
}

export default useBasemapConfig
