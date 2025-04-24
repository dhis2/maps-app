const omitPatterns = [
    // User info
    'me/authorization',
    'me?fields',

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

    entryPoints: {
        app: './src/AppWrapper.js',
        plugin: './src/PluginWrapper.js',
    },

    coreApp: true,
    dataStoreNamespace: 'DHIS2_MAPS_APP_CORE',
}

module.exports = config
