import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import union from 'lodash/fp/union';
import { init, config, getUserSettings } from 'd2/lib/d2';
import { isValidUid } from 'd2/lib/uid';
import PluginMap from './components/map/PluginMap';
import {
    mapRequest,
    getExternalLayer,
    getGoogleMapsKey,
} from './util/requests';
import { fetchLayer } from './loaders/layers';
import { configI18n } from './util/i18n';
import { translateConfig } from './util/favorites';
import { defaultBasemaps } from './constants/basemaps';
import '../scss/plugin.scss';

// Inspiration:
// pivot: https://github.com/dhis2/pivot-tables-app/blob/master/src/plugin.js
// d2-analysis: https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js

const apiVersion = 29;

const Plugin = () => {
    let _configs = [];
    let _components = {};
    let _isReady = false;
    let _isPending = false;

    function getType() {
        return 'MAP';
    }

    function add(...configs) {
        configs = Array.isArray(configs[0]) ? configs[0] : configs;

        if (configs.length) {
            _configs = [..._configs, ...configs];
            configs.forEach(renderLoadingIndicator);
        }
    }

    function load(...configs) {
        add(Array.isArray(configs[0]) ? configs[0] : configs);

        if (_isReady) {
            onInit();
        } else if (!_isPending) {
            _isPending = true;
            const { url, username, password } = this;
            initialize(url, username, password);
        }
    }

    function initialize(url, username, password) {
        if (url) {
            config.baseUrl = `${url}/api/${apiVersion}`;
        }

        if (username && password) {
            config.context = { auth: `${username}:${password}` };
        }

        config.schemas = union(config.schemas, [
            'dataElement',
            'dataSet',
            'externalMapLayer',
            'indicator',
            'legendSet',
            'map',
            'optionSet',
            'organisationUnitGroup',
            'organisationUnitGroupSet',
            'programStage',
        ]);

        getUserSettings()
            .then(configI18n)
            .then(init)
            .then(onInit);
    }

    function onInit() {
        _isReady = true;

        while (_configs.length) {
            loadMap(_configs.shift());
        }
    }

    function loadMap(config) {
        if (config.id && !isUnmounted(config.el)) {
            // Load favorite
            mapRequest(config.id).then(favorite =>
                loadLayers({
                    ...config,
                    ...favorite,
                })
            );
        } else {
            loadLayers(translateConfig(config));
        }
    }

    async function loadLayers(config) {
        if (!isUnmounted(config.el)) {
            let basemap = config.basemap;
            const basemapId = basemap.id || basemap;

            if (isValidUid(basemapId)) {
                const externalLayer = await getExternalLayer(basemapId);
                basemap = {
                    id: basemapId,
                    config: {
                        type: 'tileLayer',
                        ...externalLayer,
                    },
                };
            } else {
                basemap = defaultBasemaps.find(map => map.id === basemapId);
            }

            if (basemapId.substring(0, 6) === 'google') {
                basemap.config.apiKey = await getGoogleMapsKey();
            }

            if (config.mapViews) {
                Promise.all(config.mapViews.map(fetchLayer)).then(mapViews =>
                    drawMap({
                        ...config,
                        mapViews,
                        basemap,
                    })
                );
            }
        }
    }

    function drawMap(config) {
        if (config.el && !isUnmounted(config.el)) {
            const domEl = document.getElementById(config.el);

            if (domEl) {
                _components[config.el] = render(
                    <PluginMap {...config} />,
                    domEl
                );
            }
        }
    }

    function renderLoadingIndicator(config) {
        if (config.el) {
            const domEl = document.getElementById(config.el);

            if (domEl) {
                domEl.innerHTML = ''; // TODO: Remove when unmount is used
                const div = document.createElement('div');
                div.className = 'spinner';
                domEl.appendChild(div);
                _components[config.el] = 'loading';
            }
        }
    }

    function unmount(el) {
        const mapComponent = _components[el];

        if (mapComponent) {
            _components[el] = 'unmounted';

            const domEl = document.getElementById(el);

            if (domEl) {
                if (mapComponent === 'loading') {
                    domEl.innerHTML = ''; // Remove spinner
                    return true;
                } else if (mapComponent instanceof PluginMap) {
                    return unmountComponentAtNode(domEl);
                }
            }
        }

        return false;
    }

    function isUnmounted(el) {
        return el && _components[el] === 'unmounted';
    }

    // Should be called if the map container is resized
    function resize(el) {
        const mapComponent = _components[el];

        if (
            mapComponent &&
            mapComponent instanceof PluginMap &&
            mapComponent.map
        ) {
            mapComponent.map.invalidateSize();
            return true;
        }

        return false;
    }

    return {
        // Public properties
        url: null,
        username: null,
        password: null,
        loadingIndicator: false,
        getType,
        load,
        add,
        unmount,
        resize,
    };
};

const mapPlugin = new Plugin();

global.mapPlugin = mapPlugin;

export default mapPlugin;
