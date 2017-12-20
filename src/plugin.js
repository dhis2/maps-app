import React from 'react';
import { render } from 'react-dom';
import { config, init } from 'd2/lib/d2';
import MapProvider from './components/map/MapProvider';
import PluginMap from './components/map/PluginMap';
import { fetchFavorite, parseFavorite } from './loaders/favorites';
import { fetchOverlay } from './loaders/overlays';
import '../scss/plugin.scss';

// Inspiration:
// pivot: https://github.com/dhis2/pivot-tables-app/blob/master/src/plugin.js
// d2-analysis: https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js

const apiVersion = 29;

const Plugin = () => {
    let _layouts = [];

    // https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js#L20
    function add(...layouts) {
        layouts = Array.isArray(layouts[0]) ? layouts[0] : layouts;

        if (layouts.length) {
            _layouts = [..._layouts, ...layouts];
        }
    }

    // https://github.com/dhis2/d2-analysis/blob/master/src/util/Plugin.js#L28
    function load(...layouts) {
        add(Array.isArray(layouts[0]) ? layouts[0] : layouts);

        const { url, username, password } = this;

        if (url, username, password) {
            config.baseUrl = `${url}/api/${apiVersion}`;
            config.context = {
                auth: `${username}:${password}`, // TODO: Right place for auth info in d2?
            };
            init().then(onInit);
        }
    }

    function onInit(d2) {
        _layouts.forEach(layout => {
            if (layout.id) {
                fetchFavorite(layout.id)
                    .then(favorite => loadOverlays({ ...layout, ...favorite }));
            }
        });
    }

    function loadOverlays(layout) {
        Promise.all(layout.mapViews.map(fetchOverlay)).then(overlays => drawMap({
            ...layout,
            overlays,
        }));
    }

    function drawMap(config) {
        render(
            <MapProvider>
                <PluginMap {...config} />
            </MapProvider>,
            document.getElementById(config.el)
        );
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