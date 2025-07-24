const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fse = require('fs-extra')

const files = ['ee_api_js_worker.js', 'ee_worker_utils.js', 'ee_worker.js']

const sourceDir = path.resolve(
    __dirname,
    '../node_modules/@dhis2/maps-gl/build/es/earthengine'
)
const targetDir = path.resolve(
    __dirname,
    '../.d2/shell/node_modules/.vite/earthengine'
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

function waitForTargetDir(timeout = 5000) {
    const interval = 200
    let waited = 0

    return new Promise((resolve) => {
        const check = () => {
            if (fs.existsSync(path.dirname(targetDir))) {
                return resolve()
            }

            if (waited >= timeout) {
                fse.ensureDirSync(targetDir)
                return resolve()
            }

            waited += interval
            setTimeout(check, interval)
        }

        check()
    })
}

;(async () => {
    try {
        console.log(log.info)
        await waitForTargetDir()
        fse.ensureDirSync(targetDir)

        for (const file of files) {
            const src = path.join(sourceDir, file)
            const dest = path.join(targetDir, file)

            if (fs.existsSync(src)) {
                fse.copySync(src, dest)
            } else {
                log.warn(`Missing: ${file}`)
            }
        }
    } catch (err) {
        log.error(`Error copying earthengine workers: ${err.message}`)
        process.exit(1)
    }
})()
