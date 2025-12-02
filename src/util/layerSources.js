import { getEarthEngineLayer } from '../constants/earthEngineLayers/index.js'

export const resolveGroupKey = (layer) => {
    return (
        layer?.group?.groupId ?? // If part of a group, use the group's ID ('population', 'temperature').
        layer?.layerId ?? // Else if single ee layer, use its layerId ('USGS/SRTMGL1_003').
        layer?.config?.id ?? // Else if external/custom layer, use config.id ('suB1SFdc6RD').
        layer?.layer // Else fallback to layer ('thematic', 'event').
    )
}

export const groupLayerSources = (layers) => {
    const groups = {}
    for (const layer of layers) {
        const key = resolveGroupKey(layer)
        if (layer.group) {
            if (!groups[key]) {
                groups[key] = {
                    layer: layer.layer,
                    id: key,
                    ...layer.group,
                    items: [],
                }
            }
            if (
                !groups[key].items.some(
                    (item) => item.layerId === layer.layerId
                )
            ) {
                groups[key].items.push({ id: layer.layerId, ...layer })
            }
        } else {
            groups[key] = { ...layer }
        }
    }
    return Object.values(groups)
}

export const getLayerSourceGroup = (layerId, layers = []) => {
    const dataset = getEarthEngineLayer(layerId)
    if (!dataset?.group) {
        return []
    }
    const allSources = [
        dataset,
        ...layers.map(getEarthEngineLayer).filter(Boolean),
    ]
    const grouped = groupLayerSources(allSources)
    return grouped.find((g) => g.id === dataset.group.groupId) || []
}
