module.exports = {
    setupTestFrameworkScriptFile: '<rootDir>/config/testSetup.js',
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
    transformIgnorePatterns: ['node_modules/(?!(d3-scale)/)'],
    moduleNameMapper: {
        '\\.(css)$': '<rootDir>/config/jest/styleMock.js',
    },
    testURL: 'http://localhost/',
    snapshotSerializers: ['enzyme-to-json/serializer'],
};
