module.exports = {
    testURL: "http://localhost/",
    setupTestFrameworkScriptFile: '<rootDir>/config/testSetup.js',
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    transformIgnorePatterns: ['/node_modules/(?!d2-ui).+\\.js$'],
    moduleNameMapper: {
        '\\.(css)$': '<rootDir>/config/jest/styleMock.js',
    },
};
