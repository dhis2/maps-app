const { chromeAllowXSiteCookies } = require('@dhis2/cypress-plugins')
const { defineConfig } = require('cypress')
const {
    downloadedFileTasks,
} = require('./cypress/plugins/downloadedFileTasks.js')
const {
    excludeByVersionTags,
} = require('./cypress/plugins/excludeByVersionTags.js')

async function setupNodeEvents(on, config) {
    chromeAllowXSiteCookies(on, config)
    excludeByVersionTags(on, config)
    downloadedFileTasks(on)

    if (!config.env.dhis2InstanceVersion) {
        throw new Error(
            'dhis2InstanceVersion is missing. Check the README for more information.'
        )
    }

    return config
}

module.exports = defineConfig({
    projectId: 'r5jduj',
    reporter: '@reportportal/agent-js-cypress',
    reporterOptions: {
        endpoint: process.env.REPORTPORTAL_ENDPOINT,
        apiKey: process.env.REPORTPORTAL_API_KEY,
        launch: 'maps_app',
        project: process.env.REPORTPORTAL_PROJECT,
        description: '',
        autoMerge: true,
        parallel: true,
        debug: false,
        restClientConfig: {
            timeout: 660000,
        },
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
                value: 'e2e',
            },
        ],
    },
    e2e: {
        setupNodeEvents,
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/integration/**/*.cy.js',
        viewportWidth: 1280,
        viewportHeight: 800,
        defaultCommandTimeout: 15000,
        // Record video
        video: true,
        /* Only compress and upload videos for failures.
         * This will save execution time and reduce the risk
         * out-of-memory issues on the CI machine */
        videoUploadOnPasses: false,
        // Enabled to reduce the risk of out-of-memory issues
        experimentalMemoryManagement: true,
        // Set to a low number to reduce the risk of out-of-memory issues
        numTestsKeptInMemory: 5,
        /* When allowing 1 retry on CI, the test suite will pass if
         * it's flaky. And/but we also get to identify flaky tests on the
         * Cypress Dashboard. */
        retries: {
            runMode: 1,
            openMode: 0,
        },
    },
    env: {
        dhis2DatatestPrefix: 'dhis2-maps',
        networkMode: 'live',
    },
})
