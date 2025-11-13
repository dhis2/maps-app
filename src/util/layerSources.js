import { getEarthEngineLayer } from '../constants/earthEngineLayers/index.js'

export const resolveGroupKey = (layer) => {
    return (
        layer?.group?.groupId ?? // If part of a group, use the group's ID ('population', 'temperature').
        layer?.layerId ?? // Else if single ee layer, use its layerId ('USGS/SRTMGL1_003').
        layer?.config?.id ?? // Else if external/custom layer, use config.id ('suB1SFdc6RD').
        layer?.layer // Else fallback to layer ('thematic', 'event').
    )
}

export const groupLayerSourcesX = (layers) => {
    const groups = {}
    for (const layer of layers) {
        const key = resolveGroupKey(layer)
        if (layer.group) {
            if (!groups[key]) {
                groups[key] = {
                    layer: layer.layer,
                    id: key,
                    name: layer.group.groupName,
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
    const groupId = dataset.group.groupId
    const subGroupId = dataset.group.subGroupId
    console.log('🚀 ~ getLayerSourceGroup ~ dataset:', dataset)
    if (!dataset?.group) {
        return []
    }
    const allSources = [
        dataset,
        ...layers.map(getEarthEngineLayer).filter(Boolean),
    ]
    const grouped = groupLayerSources(allSources)
    console.log('🚀 ~ getLayerSourceGroup ~ grouped:', grouped)
    const group = grouped.find((g) => g.id === groupId) || []
    let subGroup = []
    if (group) {
        subGroup = group.items.find((sg) => sg.id === subGroupId) || []
    }
    return { group, subGroup }
}

// --- Helper: ensure a main group object exists ---
function ensureGroup(groups, layer) {
    const g = layer.group
    if (!groups[g.groupId]) {
        groups[g.groupId] = {
            id: g.groupId,
            name: g.groupName,
            groupId: g.groupId,
            groupType: g.groupType,
            img: g.img,
            excludeOnSwitch: g.groupExcludeOnSwitch,
            items: [], // array of sub-groups
        }
    }
    return groups[g.groupId]
}

// --- Helper: ensure a subgroup object exists inside a group ---
function ensureSubGroup(group, layer) {
    const g = layer.group
    const subId = g.subGroupId || '__default__'
    let subGroup = group.items.find((sg) => sg.id === subId)

    if (!subGroup) {
        subGroup = {
            id: subId,
            name: g.subGroupName || g.groupName,
            groupId: subId,
            groupType: g.subGroupType || g.groupType,
            excludeOnSwitch:
                g.subGroupExcludeOnSwitch || g.groupExcludeOnSwitch,
            items: [],
        }
        group.items.push(subGroup)
    }

    return subGroup
}

// --- Helper: add a layer into a (sub)group if not already added ---
function addLayer(subGroup, layer) {
    if (!subGroup.items.some((l) => l.layerId === layer.layerId)) {
        subGroup.items.push({ id: layer.layerId, ...layer })
    }
}

function simplifyDefaultSubGroups(groups) {
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

// --- Main function: groups layers by group and sub-group ---
export function groupLayerSources(layers) {
    const groups = {}

    for (const layer of layers) {
        const g = layer.group

        // Case 1: no group → standalone
        if (!g) {
            groups[resolveGroupKey(layer)] = { id: layer.layerId, ...layer }
            continue
        }

        // Case 2 & 3: group exists
        const group = ensureGroup(groups, layer)
        const subGroup = ensureSubGroup(group, layer)
        addLayer(subGroup, layer)
    }

    let groupedArray = Object.values(groups)
    groupedArray = simplifyDefaultSubGroups(groupedArray)

    // Return array of groups + standalone layers
    return groupedArray
}
