const config = {
    type: 'app',
    name: 'maps',
    title: 'Maps',

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
