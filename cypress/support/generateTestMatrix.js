const fs = require('fs')
const path = require('path')

const NUMBER_OF_GROUPS = 5
const CYPRESS_FILES = {
    'cypress/integration/basemaps.cy.js': { include: false, duration: 60 },
    'cypress/integration/dataDownload.cy.js': { include: false, duration: 60 },
    'cypress/integration/dataTable.cy.js': { include: false, duration: 60 },
    'cypress/integration/fetcherrors.cy.js': { include: false, duration: 30 },
    'cypress/integration/filemenu.cy.js': { include: false, duration: 90 },
    'cypress/integration/interpretations.cy.js': {
        include: false,
        duration: 45,
    },
    'cypress/integration/keyboard.cy.js': { include: false, duration: 30 },
    'cypress/integration/manageLayerSources.cy.js': {
        include: false,
        duration: 45,
    },
    'cypress/integration/mapDownload.cy.js': { include: false, duration: 15 },
    'cypress/integration/orgUnitInfo.cy.js': { include: false, duration: 15 },
    'cypress/integration/plugin.cy.js': { include: false, duration: 15 },
    'cypress/integration/pushAnalytics.cy.js': { include: false, duration: 15 },
    'cypress/integration/requests.cy.js': { include: false, duration: 120 },
    'cypress/integration/requestsErrors.cy.js': {
        include: true,
        duration: 480,
    },
    'cypress/integration/routes.cy.js': { include: false, duration: 120 },
    'cypress/integration/systemsettings.cy.js': {
        include: false,
        duration: 45,
    },
    'cypress/integration/ui.cy.js': { include: false, duration: 30 },
    'cypress/integration/usersettings.cy.js': { include: false, duration: 45 },
    'cypress/integration/layers/eventlayer.cy.js': {
        include: false,
        duration: 210,
    },
    'cypress/integration/layers/multilayers.cy.js': {
        include: false,
        duration: 15,
    },
    'cypress/integration/layers/externallayer.cy.js': {
        include: false,
        duration: 15,
    },
    'cypress/integration/layers/orgunitlayer.cy.js': {
        include: false,
        duration: 30,
    },
    'cypress/integration/layers/facilitylayer.cy.js': {
        include: false,
        duration: 30,
    },
    'cypress/integration/layers/thematiclayer.cy.js': {
        include: false,
        duration: 240,
    },
    'cypress/integration/layers/geojsonlayer.cy.js': {
        include: false,
        duration: 30,
    },
    'cypress/integration/layers/trackedentitylayer.cy.js': {
        include: false,
        duration: 60,
    },
}

const filterFn = (fullPath) =>
    CYPRESS_FILES[fullPath] ? CYPRESS_FILES[fullPath].include : true // include files by default

const getAllFiles = (dirPath, arrayOfFiles = [], filterFn = () => true) => {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, filterFn)
        } else if (path.extname(file) === '.js' && filterFn(fullPath)) {
            arrayOfFiles.push(fullPath)
        }
    })

    return arrayOfFiles
}

const createGroupsStandard = (files, numberOfGroups = NUMBER_OF_GROUPS) => {
    let groups = []
    for (let i = 0; i < numberOfGroups; i++) {
        groups.push([])
    }

    files.forEach((file, index) => {
        groups[index % numberOfGroups].push(file)
    })
    groups = groups.map((group, index) => ({ id: index + 1, tests: group }))
    return groups
}

const createGroupsByDuration = (files, numberOfGroups = NUMBER_OF_GROUPS) => {
    const durations = Object.values(CYPRESS_FILES)
        .map((f) => f.duration)
        .filter((d) => typeof d === 'number' && !isNaN(d))
    const avgDuration =
        durations.reduce((sum, d) => sum + d, 0) / durations.length

    const enriched = files.map((f) => {
        const meta = CYPRESS_FILES[f] ?? {}
        return {
            file: f,
            duration:
                typeof meta.duration === 'number' ? meta.duration : avgDuration,
        }
    })
    // Sort longest duration first (greedy assignment works better this way)
    enriched.sort((a, b) => b.duration - a.duration)

    let groups = Array.from({ length: numberOfGroups }, (_, i) => ({
        id: i + 1,
        tests: [],
        totalDuration: 0,
    }))
    for (const file of enriched) {
        groups.sort((a, b) => a.totalDuration - b.totalDuration)
        groups[0].tests.push(file)
        groups[0].totalDuration += file.duration
    }
    groups = groups.map(({ id, tests }) => ({ id, tests }))
    return groups
}

const createGroups = (files, numberOfGroups = NUMBER_OF_GROUPS) => {
    if (!files.length || numberOfGroups < 1) {
        return []
    }

    const durations = Object.values(CYPRESS_FILES)
        .map((f) => f.duration)
        .filter((d) => typeof d === 'number' && !isNaN(d))
    const adjustedNumberOfGroups = Math.min(files.length, numberOfGroups)

    if (durations.length === 0) {
        return createGroupsStandard(files, adjustedNumberOfGroups)
    } else {
        return createGroupsByDuration(files, adjustedNumberOfGroups)
    }
}

const cypressSpecsPath = './cypress/integration'
const specs = getAllFiles(cypressSpecsPath, [], filterFn)
const groupedSpecs = createGroups(specs)

console.log(JSON.stringify(groupedSpecs))
