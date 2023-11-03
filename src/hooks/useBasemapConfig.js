import { useCachedDataQuery } from '@dhis2/analytics'
import { useState, useEffect } from 'react'
import { getFallbackBasemap } from '../constants/basemaps.js'
import { defaultBasemapState } from '../reducers/map.js'

const emptyBasemap = { config: {} }

function useBasemapConfig(selected) {
    const [basemap, setBasemap] = useState(emptyBasemap)
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap

    useEffect(() => {
        const selectedId = selected.id || defaultBasemap

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
    }, [defaultBasemap, selected, basemaps])

    return basemap
}

export default useBasemapConfig
