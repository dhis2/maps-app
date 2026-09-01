import { useMemo } from 'react'
import { useCachedData } from '../components/cachedDataProvider/CachedDataProvider.jsx'
import { mockBasemapSources } from '../constants/mockLayerSources.js'
import {
    getLayerSourcePlacement,
    PLACEMENT_BASEMAP,
} from '../util/layerSources.js'
import useAddedLayerSources from './useAddedLayerSources.js'

// PROTOTYPE ONLY - every basemap an author can pick: the ones the API gave us,
// plus the mocks, plus any registered through the manage dialog this session.
// Both the Basemap card and useBasemapConfig read this, so a picked basemap
// resolves to the right name and config rather than falling back to the
// default. Memoised because useBasemapConfig has it in an effect dependency.
const useCatalogBasemaps = () => {
    const { basemaps } = useCachedData()
    const { addedSources } = useAddedLayerSources()

    return useMemo(
        () => [
            ...basemaps,
            ...mockBasemapSources(),
            ...addedSources.filter(
                (source) =>
                    getLayerSourcePlacement(source) === PLACEMENT_BASEMAP
            ),
        ],
        [basemaps, addedSources]
    )
}

export default useCatalogBasemaps
