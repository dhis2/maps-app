const reportPortalConfig = [
    '@reportportal/agent-js-jest',
    {
        apiKey: process.env.REPORTPORTAL_API_KEY,
        endpoint: process.env.REPORTPORTAL_ENDPOINT,
        project: process.env.REPORTPORTAL_PROJECT,
        launch: 'maps_app',
        attributes: [
            {
                key: 'dhis2_version',
                value: 'master',
            },
            {
                key: 'app_name',
                value: 'maps-app',
            },
            {
                key: 'test_level',
                value: 'unit/integration',
            },
            {
                key: 'BRANCH_NAME',
                value: process.env.BRANCH_NAME,
            },
            {
                key: 'CI_BUILD_ID',
                value: process.env.CI_BUILD_ID,
            },
            {
                key: 'PR_TITLE',
                value: process.env.PR_TITLE,
            },
        ],
        description: '',
        debug: false,
    },
]
const isGithubActionsRun = process.env.CI === 'true'

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
    reporters: ['default', ...(isGithubActionsRun ? [reportPortalConfig] : [])],
}
