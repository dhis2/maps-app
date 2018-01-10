import isString from 'lodash/fp/isString';

const externalLoader = async (config) => { // Returns a promise
    if (isString(config.config)) { // From database as favorite
        config.config = JSON.parse(config.config);
        config.name = config.config.name;
    }

    return {
        ...config,
        type: 'external',
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };

};

export default externalLoader;