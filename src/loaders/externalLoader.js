import { EXTERNAL_LAYER } from '../constants/layers.js'
import { parseLayerConfig } from '../util/external.js'
import { loadLegendSet, getPredefinedLegendItems } from '../util/legend.js'

const externalLoader = async (layer, engine) => {
    let config
    if (typeof layer.config === 'string') {
        // External layer is loaded in analytical object
        config = await parseLayerConfig(layer.config, engine)
    } else {
        config = { ...layer.config }
    }

    const legend = { title: config.name }

    if (config.legendSet) {
        const legendItems = await loadLegendSet(config.legendSet)
        legend.items = getPredefinedLegendItems(legendItems)
    }

    if (config.legendSetUrl) {
        legend.url = config.legendSetUrl
    }

    return {
        ...layer,
        layer: EXTERNAL_LAYER,
        name: config.name,
        legend,
        config,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
    }
}

export default externalLoader
