const omitPatterns = [
    // User info
    'me/authorization',
    String.raw`me\?fields`,

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
                '@turf/area',
                '@turf/bbox',
                '@turf/buffer',
                '@turf/center-of-mass',
                '@turf/centroid',
                '@turf/circle',
                '@turf/jsts',
                '@turf/length',
                'comlink',
                'concaveman',
                'polylabel',
                'pretty-bytes',
                'suggestions',
                'uuid',
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
