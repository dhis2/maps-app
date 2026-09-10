import { isEqual, pick } from 'lodash'
import { validLayerProperties, validMapProperties } from './favorites.js'

// Loaders replace a layer's config with `{ ...config, ...loadedFields }` on
// every load, so compare only the saved-payload allowlist, not raw objects.
const layerFields = [...validLayerProperties, 'isVisible']
const basemapFields = ['id', 'opacity', 'isVisible']

const stripLayer = (layer) => pick(layer, layerFields)

const stripMap = (map) => ({
    ...pick(map, validMapProperties),
    basemap: pick(map.basemap, basemapFields),
    mapViews: map.mapViews.map(stripLayer),
})

export const isMapDirty = (map, savedMap) =>
    !!savedMap && !isEqual(stripMap(map), stripMap(savedMap))
