module.exports = {
    setupFilesAfterEnv: ['<rootDir>/config/testSetup.js'],
    collectCoverageFrom: ['src/**/*.{js,jsx}'],
    testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
    transformIgnorePatterns: [
        '/node_modules/(?!d3-(array|axis|color|format|interpolate|scale|selection|time)|internmap|array-move|chroma-js)',
    ],
    moduleNameMapper: {
        '\\.(css)$': 'identity-obj-proxy',
    },
    testURL: 'http://localhost/',

    testRunner: 'jest-circus/runner',
    reporters: ['default'],
    clearMocks: true,
}
