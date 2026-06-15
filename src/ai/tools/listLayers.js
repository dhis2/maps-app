/**
 * @param {() => Object} getState - Redux getState
 * @returns {() => Promise<Object>}
 */
export const makeListLayers = (getState) => async () => {
    const { map } = getState()
    const mapViews = map?.mapViews ?? []

    if (mapViews.length === 0) {
        return { layers: [], message: 'No layers on the map currently.' }
    }

    const layers = mapViews.map((layer) => ({
        id: layer.id,
        type: layer.layer,
        summary: buildSummary(layer),
    }))

    return { layers, count: layers.length }
}

const buildSummary = (layer) => {
    const parts = []

    switch (layer.layer) {
        case 'thematic': {
            const dx = layer.columns?.[0]?.items?.[0]
            const pe = layer.filters?.find((f) => f.dimension === 'pe')
                ?.items?.[0]
            if (dx?.name) {
                parts.push(dx.name)
            }
            if (layer.thematicMapType) {
                parts.push(layer.thematicMapType)
            }
            if (pe?.id) {
                parts.push(pe.id)
            }
            break
        }
        case 'facility': {
            const gs = layer.organisationUnitGroupSet
            parts.push('facility layer')
            if (gs?.displayName) {
                parts.push(`styled by ${gs.displayName}`)
            }
            break
        }
        case 'orgUnit':
            parts.push('org unit / boundaries layer')
            break
        default:
            parts.push(layer.layer ?? 'unknown type')
    }

    return parts.join(' · ')
}
