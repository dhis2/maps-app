module.exports = {
    setupFilesAfterEnv: ['<rootDir>/config/testSetup.js'],
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
    transformIgnorePatterns: [
        '/node_modules/(?!d3-(array|axis|color|format|interpolate|scale|selection|time)|internmap)',
    ],
    moduleNameMapper: {
        '\\.(css)$': 'identity-obj-proxy',
    },
    testURL: 'http://localhost/',
    snapshotSerializers: ['enzyme-to-json/serializer'],

    testRunner: 'jest-circus/runner',
    reporters: [
        'default',
        [
            '@reportportal/agent-js-jest',
            {
                apiKey: process.env.REPORTPORTAL_API_KEY,
                endpoint: process.env.REPORTPORTAL_ENDPOINT,
                project: process.env.REPORTPORTAL_PROJECT,
                launch: 'maps_app',
                attributes: [
                    {
                        key: 'version',
                        value: 'master',
                    },
                    {
                        key: 'app_name',
                        value: 'maps_app',
                    },
                    {
                        key: 'test_level',
                        value: 'unit/integration',
                    },
                ],
                description: '',
                debug: true,
            },
        ],
    ],
}
