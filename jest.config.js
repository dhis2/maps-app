module.exports = {
    setupTestFrameworkScriptFile: '<rootDir>/config/setup.js',
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    transformIgnorePatterns: ['/node_modules/(?!d2-ui).+\\.js$'],
    moduleNameMapper: {
        '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    },
};
