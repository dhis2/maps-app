const {
    networkShim,
    chromeAllowXSiteCookies,
} = require('@dhis2/cypress-plugins')
const { tagify } = require('cypress-tags')
const { getExcludedTags } = require('../support/getExcludedTags.js')

module.exports = (on, config) => {
    networkShim(on)
    chromeAllowXSiteCookies(on)

    if (!config.env.dhis2InstanceVersion) {
        throw new Error(
            'dhis2InstanceVersion is missing. Check the README for more information.'
        )
    }

    const excludedTags = getExcludedTags(config.env.dhis2InstanceVersion)

    console.log('instanceVersion', config.env.dhis2InstanceVersion)
    console.log('tags to exclude from testing', excludedTags)

    config.env.CYPRESS_EXCLUDE_TAGS = excludedTags.join(',')

    on('file:preprocessor', tagify(config))
}
