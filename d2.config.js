const config = {
    type: 'app',
    name: 'maps-climate-pilot',
    id: 'ad3a9d16-e56f-48a9-a9ed-b906d5646e74',
    title: 'Maps Data Climate Pilot (experimental)',

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
}

module.exports = config
