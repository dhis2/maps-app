import { parseLayerConfig } from '../util/external';
import { loadLegendSet, getPredefinedLegendItems } from '../util/legend';
import { EXTERNAL_LAYER } from '../constants/layers';

const externalLoader = async layer => {
    let { config } = layer;

    if (typeof config === 'string') {
        // External layer is loaded in analytical object
        config = await parseLayerConfig(config);
    } else {
        delete layer.id;
    }

    const { name, legendSet, legendSetUrl } = config;

    const legend = { title: name };

    if (legendSet) {
        const legendItems = await loadLegendSet(legendSet);
        legend.items = getPredefinedLegendItems(legendItems);
    }

    if (legendSetUrl) {
        legend.url = legendSetUrl;
    }

    return {
        ...layer,
        layer: EXTERNAL_LAYER,
        name,
        legend,
        config,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default externalLoader;
