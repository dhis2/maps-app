const fs = require('node:fs')
const path = require('node:path')
const CYPRESS_FILES = require('./cypressFiles.json')

const NUMBER_OF_GROUPS = 5

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
        .filter((d) => typeof d === 'number' && !Number.isNaN(d))
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

    const groups = Array.from({ length: numberOfGroups }, (_, i) => ({
        id: i + 1,
        tests: [],
        totalDuration: 0,
    }))
    for (const f of enriched) {
        groups.sort((a, b) => a.totalDuration - b.totalDuration)
        groups[0].tests.push(f.file)
        groups[0].totalDuration += f.duration
    }
    return groups.sort((a, b) => a.id - b.id)
}

const createGroups = (files, numberOfGroups = NUMBER_OF_GROUPS) => {
    if (!files.length || numberOfGroups < 1) {
        return []
    }

    const durations = Object.values(CYPRESS_FILES)
        .map((f) => f.duration)
        .filter((d) => typeof d === 'number' && !Number.isNaN(d))
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
