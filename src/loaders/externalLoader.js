// import { isString } from 'lodash/fp';
// import { loadExternalLayer } from '../util/externalLayers';
import { loadLegendSet, getPredefinedLegendItems } from '../util/legend';

const externalLoader = async layer => {
    const { config } = layer;

    // console.log('externalLoader', layer, config);

    // const { id } = config;
    // const layer = await loadExternalLayer(id);

    // id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl'

    // console.log('externalLoader', id, layer);

    // From database as favorite
    /*
    if (isString(config.config)) {
        config.config = JSON.parse(config.config);
        config.name = config.config.name;
        config.legendSetUrl = config.config.legendSetUrl;
    }
    */

    let { legendSet, legendSetUrl } = config;

    const legend = {
        title: config.name,
    };

    if (legendSet) {
        legendSet = await loadLegendSet(legendSet);
        legend.items = getPredefinedLegendItems(legendSet);
    }

    if (legendSetUrl) {
        legend.url = config.legendSetUrl;
    }

    delete layer.id;

    return {
        ...layer,
        layer: 'external',
        legend,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default externalLoader;
