import { parseLayerConfig } from '../util/external.js'

const EMPTY_FEATURE_STYLE = {}
const geoJsonUrlLoader = async (layer) => {
    const { name, config } = layer

    let newConfig
    let featureStyle
    // keep featureStyle property outside of config while in app
    if (typeof config === 'string') {
        // External layer is loaded in analytical object
        newConfig = await parseLayerConfig(config)
        featureStyle = { ...newConfig.featureStyle } || EMPTY_FEATURE_STYLE
        delete newConfig.featureStyle
    } else {
        newConfig = { ...config }
        featureStyle = layer.featureStyle || EMPTY_FEATURE_STYLE
    }

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
        name: newConfig.name, // TODO - will be fixed by DHIS2-16088
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
