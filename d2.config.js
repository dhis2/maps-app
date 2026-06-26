const fs = require('node:fs')

const omitPatterns = [
    // User info
    'me/authorization',
    'me\\?fields',

    // Settings
    'systemSettings',
    'userSettings',

    // Data
    'externalMapLayers',
    'geoFeatures',
    'analytics',
    'tracker/trackedEntities',

    // Metadata
    'dataElements',
    'trackedEntityAttributes',
    'optionSets',
    'legendSets',
    'programs',
    'programStages',
    'trackedEntityTypes',
    'relationshipTypes',
    'organisationUnitLevels',
    'organisationUnitGroupSets',
]

const config = {
    type: 'app',
    name: 'maps',
    id: 'ad3a9d16-e56f-48a9-a9ed-b906d5646e74',
    title: 'Maps',

    minDHIS2Version: '2.40',

    pluginType: 'DASHBOARD',

    pwa: {
        enabled: true,
        caching: {
            patternsToOmitFromAppShell: [
                new RegExp(`^(?!.*(${omitPatterns.join('|')})).*$`),
            ],
            globsToOmitFromPrecache: ['fonts/**', 'images/**'],
        },
    },

    viteConfigExtensions: {
        plugins: [
            {
                // Wraps the CJS Google EE API bundle as ESM so Vite doesn't
                // flag it as an unoptimised dep and trigger a full-reload when
                // the EE worker first imports it.
                name: 'ee-api-js-worker-esm',
                apply: 'serve',
                load(id) {
                    if (
                        id.endsWith('/ee_api_js_worker.js') &&
                        !id.includes('?')
                    ) {
                        const content = fs.readFileSync(id, 'utf-8')
                        return {
                            code:
                                'const module={exports:{}};const exports=module.exports;\n' +
                                content +
                                '\nexport default module.exports;',
                            map: null,
                        }
                    }
                },
            },
        ],
        optimizeDeps: {
            // Excluded so Vite serves maps-gl via /@fs/... with its full
            // transform pipeline, which lets the EE worker URL resolve to the
            // actual source file (rather than /.vite/earthengine/... where
            // bare imports are not rewritten).
            exclude: ['@dhis2/maps-gl'],
            // maps-gl's CJS deps must be listed explicitly; Vite's scanner
            // won't traverse an excluded package to discover them.
            include: [
                'maplibre-gl',
                'fetch-jsonp',
                'lodash.throttle',
                '@mapbox/sphericalmercator',
                '@turf/jsts',
                'concaveman',
                'polylabel',
                'pretty-bytes',
                'suggestions',
            ],
            esbuildOptions: {
                target: 'es2022',
            },
        },
        build: {
            target: 'es2022',
            rollupOptions: {
                output: {
                    manualChunks: {
                        'maps-gl': ['@dhis2/maps-gl'],
                    },
                },
            },
        },
    },

    entryPoints: {
        app: './src/AppWrapper.jsx',
        plugin: './src/PluginWrapper.jsx',
    },

    coreApp: true,
    dataStoreNamespace: 'DHIS2_MAPS_APP_CORE',
}

module.exports = config
