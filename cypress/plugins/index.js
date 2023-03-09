const { existsSync, readdirSync, lstatSync } = require('fs')
const path = require('path')
const { chromeAllowXSiteCookies } = require('@dhis2/cypress-plugins')
const fsExtra = require('fs-extra')

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

module.exports = (on) => {
    chromeAllowXSiteCookies(on)
    on('task', {
        getLastDownloadFilePath,
        emptyDownloadsFolder,
    })
}
