const fs = require('fs')
const path = require('path')

const excludedFiles = new Set([
    'basemaps.cy.js',
    'dataDownload.cy.js',
    'dataTable.cy.js',
    'fetcherrors.cy.js',
    'filemenu.cy.js',
    'interpretations.cy.js',
    'keyboard.cy.js',
    'manageLayerSources.cy.js',
    'mapDownload.cy.js',
    'orgUnitInfo.cy.js',
    'plugin.cy.js',
    'pushAnalytics.cy.js',
    'requests.cy.js',
    'routes.cy.js',
    'systemsettings.cy.js',
    'ui.cy.js',
    'usersettings.cy.js',
    'eventlayer.cy.js',
    'multilayers.cy.js',
    'externallayer.cy.js',
    'orgunitlayer.cy.js',
    'facilitylayer.cy.js',
    'thematiclayer.cy.js',
    'geojsonlayer.cy.js',
    'trackedentitylayer.cy.js',
])

const filterFn = (file) => !excludedFiles.has(file)

const getAllFiles = (dirPath, arrayOfFiles = [], filterFn = () => true) => {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, filterFn)
        } else if (path.extname(file) === '.js' && filterFn(file, fullPath)) {
            arrayOfFiles.push(fullPath)
        }
    })

    return arrayOfFiles
}

const createGroups = (files, numberOfGroups = 1) => {
    const groups = []
    for (let i = 0; i < numberOfGroups; i++) {
        groups.push([])
    }

    files.forEach((file, index) => {
        groups[index % numberOfGroups].push(file)
    })

    return groups.map((group, index) => ({ id: index + 1, tests: group }))
}

const cypressSpecsPath = './cypress/integration'
const specs = getAllFiles(cypressSpecsPath, [], filterFn)
const groupedSpecs = createGroups(specs)

console.log(JSON.stringify(groupedSpecs))
