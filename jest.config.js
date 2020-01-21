module.exports = {
    setupFilesAfterEnv: [ '<rootDir>/config/testSetup.js' ],
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
    transformIgnorePatterns: ['node_modules/(?!(d3-scale)/)'],
    testEnvironment: 'node',
    globals: {
        window: true,
        document: true,
        navigator: true,
        Element: true,
    },
    snapshotSerializers: ['enzyme-to-json/serializer'],
};
