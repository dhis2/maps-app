import { getEarthEngineLayer } from '../constants/earthEngineLayers/index.js'

export const resolveGroupKey = (layer) => {
    return (
        layer?.grouping?.group.id ?? // If part of a group, use the group's ID ('population', 'temperature').
        layer?.layerId ?? // Else if single ee layer, use its layerId ('USGS/SRTMGL1_003').
        layer?.config?.id ?? // Else if external/custom layer, use config.id ('suB1SFdc6RD').
        layer?.layer // Else fallback to layer ('thematic', 'event').
    )
}

export const getLayerSourceGrouping = (layerId, layers = []) => {
    const grouping = {}
    const dataset = getEarthEngineLayer(layerId)
    if (!dataset?.grouping?.group) {
        return grouping
    }
    const { id: groupId, type: groupType } = dataset.grouping.group
    const { id: subGroupId, type: subGroupType } =
        dataset.grouping.subGroup || {}

    const mappedLayers = layers.map(getEarthEngineLayer).filter(Boolean)
    const allSources = mappedLayers.find(
        ({ layerId }) => layerId === dataset.layerId
    )
        ? mappedLayers
        : [dataset, ...mappedLayers]
    const grouped = groupLayerSources(allSources)

    const group = grouped.find((g) => g.id === groupId)
    grouping[groupType] = {
        id: subGroupId ?? layerId,
        group: group,
    }
    if (group) {
        const subGroup = group.items.find((sg) => sg.id === subGroupId)
        grouping[subGroupType] = { id: layerId, group: subGroup }
    }
    return grouping
}

const ensureGroup = (groups, layer) => {
    const g = layer.grouping.group
    if (!groups[g.id]) {
        groups[g.id] = { ...g, items: [] }
    }
    return groups[g.id]
}

const ensureSubGroup = (group, layer) => {
    const g = layer.grouping.subGroup || {}
    const subId = g.id || '__default__'
    let subGroup = group.items.find((sg) => sg.id === subId)
    if (!subGroup) {
        subGroup = { ...g, id: subId, items: [] }
        group.items.push(subGroup)
    }
    return subGroup
}

const addLayer = (subGroup, layer) => {
    if (!subGroup.items.some((l) => l.layerId === layer.layerId)) {
        subGroup.items.push({ id: layer.layerId, ...layer })
    }
}

const simplifyDefaultSubGroups = (groups) => {
    return groups.map((group) => {
        if (
            group.items &&
            group.items.length === 1 &&
            group.items[0].id === '__default__'
        ) {
            group.items = group.items[0].items
        }
        return group
    })
}

export const groupLayerSources = (layers) => {
    const groups = {}
    for (const layer of layers) {
        const g = layer.grouping
        if (!g) {
            groups[resolveGroupKey(layer)] = { ...layer }
            continue
        }
        const group = ensureGroup(groups, layer)
        const subGroup = ensureSubGroup(group, layer)
        addLayer(subGroup, layer)
    }

    let groupedArray = Object.values(groups)
    groupedArray = simplifyDefaultSubGroups(groupedArray)

    return groupedArray
}
