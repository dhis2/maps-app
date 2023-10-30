import { parseLayerConfig } from '../util/external.js'

const geoJsonUrlLoader = async (layer) => {
    const { name, config } = layer

    let newConfig
    if (typeof config === 'string') {
        // External layer is loaded in analytical object
        newConfig = await parseLayerConfig(config)
    } else {
        newConfig = { ...config }
    }

    // TODO - keep the config updated with the latest featureStyle - clean this up
    const featureStyle = layer.featureStyle
        ? { ...layer.featureStyle }
        : { ...newConfig.featureStyle } || {}

    newConfig.featureStyle = featureStyle

    const geoJson = await fetch(newConfig.url).then((response) =>
        response.json()
    )

    const legend = { title: name, items: [] }
    legend.items.push({
        name: 'Feature',
        ...featureStyle,
        color: featureStyle.strokeColor,
        weight: featureStyle.weight,
    })

    return {
        ...layer,
        name,
        legend,
        data: geoJson?.features,
        config: newConfig,
        featureStyle,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    }
}

export default geoJsonUrlLoader
