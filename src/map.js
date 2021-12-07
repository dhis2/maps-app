import React, { createRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import {
    StylesProvider,
    createGenerateClassName,
} from '@material-ui/core/styles';
import { union } from 'lodash/fp';
import { init, config, getUserSettings } from 'd2';
import { isValidUid, generateUid } from 'd2/uid';
import log from 'loglevel'; // TODO: Remove version logging
import i18n from './locales';
import Plugin from './components/plugin/Plugin';
import {
    mapRequest,
    getExternalLayer,
    getBingMapsApiKey,
} from './util/requests';
import { fetchLayer } from './loaders/layers';
import { translateConfig } from './util/favorites';
import { defaultBasemaps } from './constants/basemaps';
import { version } from '../package.json'; // TODO: Remove version logging

const apiVersion = 35;

log.info(`Maps plugin: ${version}`); // TODO: Remove version logging

const PluginContainer = () => {
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
            config.appUrl = url;
            config.baseUrl = `${url}/api/${apiVersion}`;
        }

        if (username && password) {
            config.headers = {
                Authorization: 'Basic ' + btoa(`${username}:${password}`),
            };
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
            'organisationUnitLevel',
            'programStage',
        ]);

        getUserSettings()
            .then(configI18n)
            .then(init)
            .then(onInit);
    }

    function configI18n(userSettings) {
        i18n.changeLanguage(userSettings.keyUiLocale);
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
            let basemap = config.basemap || 'osmLight';

            // Default basemap is required, visibility is set to false below
            if (basemap === 'none') {
                basemap = 'osmLight';
            }

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
                basemap = defaultBasemaps().find(map => map.id === basemapId);
            }

            if (basemapId.substring(0, 4) === 'bing') {
                basemap.config.apiKey = await getBingMapsApiKey();
            }

            if (config.mapViews) {
                if (config.userOrgUnit) {
                    config.mapViews = config.mapViews.map(mapView => ({
                        ...mapView,
                        userOrgUnit: config.userOrgUnit,
                    }));
                }

                if (config.basemap === 'none') {
                    basemap.isVisible = false;
                }

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
                const ref = createRef();

                // Used to avoid class names collisions with multiple maps on a dashboard
                const id = config.id || generateUid();

                const generateClassName = createGenerateClassName({
                    productionPrefix: `map-plugin-${id}-`,
                });

                render(
                    <StylesProvider generateClassName={generateClassName}>
                        <Plugin innerRef={ref} {...config} />
                    </StylesProvider>,
                    domEl
                );

                if (config.onReady) {
                    config.onReady();
                }

                _components[config.el] = ref;
            }
        }
    }

    function renderLoadingIndicator(config) {
        if (config.el) {
            const domEl = document.getElementById(config.el);

            if (domEl) {
                domEl.innerHTML = '';
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
                } else if (mapComponent.current) {
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

        if (mapComponent && mapComponent.current) {
            mapComponent.current.resize();
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
        resize,
        unmount,
        remove: unmount,
    };
};

const mapPlugin = new PluginContainer();

global.mapPlugin = mapPlugin;

export default mapPlugin;
