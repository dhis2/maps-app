const config = {
    type: 'app',
    name: 'maps',
    id: 'ad3a9d16-e56f-48a9-a9ed-b906d5646e74',
    title: 'Maps',

    minDHIS2Version: '2.40',

    pwa: {
        enabled: true,
        caching: {
            patternsToOmitFromAppShell: [/.*/],
            globsToOmitFromPrecache: ['fonts/**', 'images/**'],
        },
    },

    entryPoints: {
        app: './src/AppWrapper.js',
        plugin: './src/PluginWrapper.js',
    },

    coreApp: true,

    dataStoreNamespace: 'DHIS_WEB_MAPS',
}

module.exports = config
