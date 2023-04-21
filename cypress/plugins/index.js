const { existsSync, readdirSync, lstatSync } = require('fs')
const path = require('path')
const {
    networkShim,
    chromeAllowXSiteCookies,
} = require('@dhis2/cypress-plugins')
const { tagify } = require('cypress-tags')
const fsExtra = require('fs-extra')
const { getExcludedTags } = require('../support/getExcludedTags.js')

const downloadsDirPath = 'cypress/downloads'

const getLastDownloadFilePath = () => {
    if (!existsSync(downloadsDirPath)) {
        return null
    }

    const filesOrdered = readdirSync(downloadsDirPath)
        .map((entry) => path.join(downloadsDirPath, entry))
        .filter((entryWithPath) => lstatSync(entryWithPath).isFile())
        .map((fileName) => ({ fileName, mtime: lstatSync(fileName).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    if (!filesOrdered.length) {
        return null
    }

    // TODO: this works only for chrome family browsers
    if (filesOrdered[0].fileName.indexOf('crdownload') > -1) {
        return null
    }

    return filesOrdered[0].fileName
}

const emptyDownloadsFolder = () => {
    fsExtra.emptyDirSync(downloadsDirPath)
    return null
}

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
    on('task', {
        getLastDownloadFilePath,
        emptyDownloadsFolder,
    })
}
