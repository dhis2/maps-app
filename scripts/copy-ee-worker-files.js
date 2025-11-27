const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fse = require('fs-extra')

const files = [
    'ee_api_js_worker.js',
    'ee_worker_cache.js',
    'ee_worker_utils.js',
    'ee_worker.js',
]

const sourceDir = path.resolve(
    __dirname,
    '../node_modules/@dhis2/maps-gl/build/es/earthengine'
)
const targetDir = path.resolve(
    __dirname,
    '../node_modules/@dhis2/app-shell/node_modules/.vite/earthengine'
)

const log = {
    info: chalk.cyan('Copying maps-gl earthengine worker files...'),
    warn: (msg) => console.warn(chalk.dim(`${msg}`)),
    error: (msg) => console.error(chalk.red(`${msg}`)),
}

if (process.env.NODE_ENV === 'production') {
    console.log(
        chalk.gray(
            'Skipping maps-gl earthengine worker files copy (NODE_ENV=production)'
        )
    )
    process.exit(0)
}

try {
    console.log(log.info)

    fse.ensureDirSync(targetDir)

    for (const file of files) {
        const source = path.join(sourceDir, file)
        const target = path.join(targetDir, file)

        if (fs.existsSync(source)) {
            fse.copySync(source, target)
        } else {
            log.warn(`Missing: ${file}`)
        }
    }
} catch (err) {
    log.error(`Error copying earthengine workers: ${err.message}`)
    process.exit(1)
}
