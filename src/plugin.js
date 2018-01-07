import React from 'react';
import { render } from 'react-dom';
import { init, config } from 'd2/lib/d2';
import PluginMap from './components/map/PluginMap';
import { mapRequest } from './util/requests';
import { fetchLayer } from './loaders/layers';

import '../scss/plugin.scss';

// Inspiration:
// pivot: https://github.com/dhis2/pivot-tables-app/blob/master/src/plugin.js
// d2-analysis: https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js

const apiVersion = 29;

console.log('LOADED?');

const Plugin = () => {
    let _configs = [];

    // https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js#L20
    function add(...configs) {
        configs = Array.isArray(configs[0]) ? configs[0] : configs;

        if (configs.length) {
            _configs = [..._configs, ...configs];
        }
    }

    // https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js#L28
    function load(...configs) {
        add(Array.isArray(configs[0]) ? configs[0] : configs);

        const { url, username, password } = this;

        if (url, username, password) {
            // Config options can be added to init method below when all data is fetched through d2
            config.baseUrl = `${url}/api/${apiVersion}`;
            config.context =  { auth: `${username}:${password}` };
            config.schemas = [ 'map', 'legendSet' ];

            init().then(onInit);
        }
    }

    function onInit() {
        _configs.forEach(config => {
            if (config.id) {
                mapRequest(config.id)
                    .then(favorite => loadOverlays({
                        ...config,
                        ...favorite,
                    }));
            }
        });
    }

    function loadOverlays(config) {
        Promise.all(config.mapViews.map(fetchLayer)).then(mapViews => drawMap({
            ...config,
            mapViews,
        }));
    }

    function drawMap(config) {
        render(<PluginMap {...config} />, document.getElementById(config.el));
    }

    return { // Public properties
        url: null,
        username: null,
        password: null,
        loadingIndicator: false,
        load,
        add,
    };
};

global.mapsPlugin = new Plugin();