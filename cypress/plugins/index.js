/* eslint-disable-next-line no-unused-vars */
const plugins = require('@dhis2/cli-utils-cypress/plugins');
// const { initPlugin } = require('cypress-plugin-snapshots/plugin');
const {
    addMatchImageSnapshotPlugin,
} = require('cypress-image-snapshot/plugin');

module.exports = (on, config) => {
    on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
            const disabledChromiumFeatures = [
                'SameSiteByDefaultCookies',
                'CookiesWithoutSameSiteMustBeSecure',
                'SameSiteDefaultChecksMethodRigorously',
            ];
            launchOptions.args.push(
                `--disable-features=${disabledChromiumFeatures.join(',')}`
            );
        }

        return launchOptions;
    });

    // initPlugin(on, config);
    addMatchImageSnapshotPlugin(on, config);

    plugins(on, config);

    return config;
};
