import isString from 'd2-utilizr/lib/isString';

const externalLoader = async (config) => { // Returns a promise
    if (isString(config.config)) { // From database as favorite
        config.config = JSON.parse(layer.config);
        config.title = layer.config.name;
    }

    // TODO: Add legend support

    return {
        ...config,
        type: 'external',
        subtitle: 'External layer',
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };

};

export default externalLoader;