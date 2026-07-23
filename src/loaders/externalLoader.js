import { WARNING_EXTERNAL_LAYER_NOT_FOUND } from '../constants/alerts.js'
import { EXTERNAL_LAYER } from '../constants/layers.js'
import { parseLayerConfig } from '../util/external.js'
import { getPredefinedLegendItems } from '../util/legend.js'
import { LEGEND_SET_QUERY } from '../util/requests.js'

const externalLoader = async ({ config: layer, engine }) => {
    let config
    const alerts = []
    if (typeof layer.config === 'string') {
        // External layer is loaded in analytical object
        const parsed = await parseLayerConfig(layer.config, engine)
        config = parsed.config
        if (parsed.notFound) {
            alerts.push({
                code: WARNING_EXTERNAL_LAYER_NOT_FOUND,
                message: layer.name,
            })
        }
    } else {
        config = { ...layer.config }
    }

    const legend = { title: config.name }

    if (config.legendSet) {
        const { legendSet: legendItems } = await engine.query(
            LEGEND_SET_QUERY,
            {
                variables: { id: config.legendSet.id },
            }
        )
        legend.items = getPredefinedLegendItems(legendItems)
    }

    if (config.legendSetUrl) {
        legend.url = config.legendSetUrl
    }

    return {
        ...layer,
        layer: EXTERNAL_LAYER,
        name: config.name, // Overrides layer.name from spread — redundant on 2.42+ (DHIS2-16088), remove when 2.41 support is dropped
        legend,
        config,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        ...(alerts.length ? { alerts } : {}),
    }
}

export default externalLoader
