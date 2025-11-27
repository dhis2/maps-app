module.exports = {
    setupFilesAfterEnv: ['<rootDir>/config/testSetup.js'],
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
    transformIgnorePatterns: [
        // allow transforming some ESM modules that ship modern syntax
        '/node_modules/(?!(d3-(array|axis|color|format|interpolate|scale|selection|time|time-format|scale)|d3-scale|d3-time-format|internmap|workbox-precaching|workbox-core|workbox-strategies|workbox-routing|@dhis2/pwa|@dhis2/app-adapter)/)'
    ],
    moduleNameMapper: {
        '\\.(css)$': 'identity-obj-proxy',
        // Map relative .d2/shell imports for cypress plugins back to repo cypress folder
        '^\\.\\./\\.\\./cypress/plugins/(.*)$': '<rootDir>/cypress/plugins/$1',
        // Map relative .d2/shell import for d2.config back to repo root d2.config
        '^\\.\\.\\/\\.\\.\\/d2.config.js$': '<rootDir>/d2.config.js',
    },
    testURL: 'http://localhost/',
    testEnvironment: 'jsdom',

    testRunner: 'jest-circus/runner',
    reporters: ['default'],
    clearMocks: true,
}
