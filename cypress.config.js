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

    Cypress.on('window:before:load', (win) => {
        const originalGetContext = win.HTMLCanvasElement.prototype.getContext
        win.HTMLCanvasElement.prototype.getContext = function (
            type,
            attrs = {}
        ) {
            if (type === 'webgl' || type === 'webgl2') {
                delete attrs.powerPreference
                delete attrs.failIfMajorPerformanceCaveat
            }

            return originalGetContext.call(this, type, attrs)
        }
    })

    if (!config.env.dhis2InstanceVersion) {
        throw new Error(
            'dhis2InstanceVersion is missing. Check the README for more information.'
        )
    }

    return config
}

module.exports = defineConfig({
    projectId: 'r5jduj',
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
        numTestsKeptInMemory: 3,
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
        dhis2BaseUrl: 'https://test.e2e.dhis2.org/anly-42',
        dhis2InstanceVersion: '2.42',
        dhis2Username: 'admin',
        dhis2Password: 'district',
        networkMode: 'live',
    },
})
