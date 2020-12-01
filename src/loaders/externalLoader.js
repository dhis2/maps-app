import { parseLayerConfig } from '../util/external';
import { loadLegendSet, getPredefinedLegendItems } from '../util/legend';

const externalLoader = async layer => {
    let { config } = layer;

    if (typeof config === 'string') {
        // External layer is loaded in analytical object
        config = parseLayerConfig(config);
    }

    const { name, legendSet, legendSetUrl } = config;

    const legend = {
        title: config.name,
    };

    if (legendSet) {
        const legendItems = await loadLegendSet(legendSet);
        legend.items = getPredefinedLegendItems(legendItems);
    }

    if (legendSetUrl) {
        legend.url = legendSetUrl;
    }

    delete layer.id;

    return {
        ...layer,
        layer: 'external',
        name,
        legend,
        config,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default externalLoader;
