// One-off maintenance script: refreshes the `duration` values in
// ./cypressFiles.json from real per-spec durations found in recent CI job
// logs, so the shard-balancing matrix stays accurate.
//
// Run by hand whenever CI shard balance visibly drifts - not scheduled.
//
// Usage:
//   yarn cy:update-durations [--runs=8] [--repo=dhis2/maps-app] [--workflow=verify-pr.yml] [--write]
//
// Without --write, prints an old-vs-new diff only and does not touch any file.
// Requires the `gh` CLI to be installed and authenticated.

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
    const prefix = `--${name}=`
    const found = args.find((arg) => arg.startsWith(prefix))
    return found ? found.slice(prefix.length) : fallback
}

const REPO = getArg('repo', 'dhis2/maps-app')
const WORKFLOW = getArg('workflow', 'verify-pr.yml')
const NUM_RUNS = Number(getArg('runs', '8'))
const WRITE = args.includes('--write')

const gh = (ghArgs) =>
    execFileSync('gh', ghArgs, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 200,
    })

const listSuccessfulRunIds = () => {
    const out = gh([
        'run',
        'list',
        `--repo=${REPO}`,
        `--workflow=${WORKFLOW}`,
        '--status=success',
        `--limit=${NUM_RUNS}`,
        '--json=databaseId',
    ])
    return JSON.parse(out).map((run) => run.databaseId)
}

const listE2eJobIds = (runId) => {
    const out = gh([
        'run',
        'view',
        String(runId),
        `--repo=${REPO}`,
        '--json=jobs',
    ])
    const { jobs } = JSON.parse(out)
    return jobs
        .filter((job) => job.name.includes('call-workflow-e2e-prod'))
        .map((job) => job.databaseId)
}

// GH Actions logs are colorized; strip ANSI codes first since they embed
// digits (e.g. "\x1b[90m") that would otherwise break the summary-row match
// eslint-disable-next-line no-control-regex
const ANSI_CODE = /\x1b\[[0-9;]*m/g
const stripAnsi = (str) => str.replace(ANSI_CODE, '')
const SUMMARY_ROW = /([\w-]+\.cy\.js)\D+(\d{2}):(\d{2})\s/g

const parseDurations = (log) => {
    const cleaned = stripAnsi(log)
    const results = []
    let match
    SUMMARY_ROW.lastIndex = 0
    while ((match = SUMMARY_ROW.exec(cleaned))) {
        const [, specFile, mm, ss] = match
        results.push({ specFile, seconds: Number(mm) * 60 + Number(ss) })
    }
    return results
}

const median = (nums) => {
    const sorted = [...nums].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

const main = () => {
    console.log(
        `Fetching last ${NUM_RUNS} successful "${WORKFLOW}" runs from ${REPO}...`
    )
    const runIds = listSuccessfulRunIds()

    const durationsBySpec = new Map() // basename -> seconds[]

    for (const runId of runIds) {
        const jobIds = listE2eJobIds(runId)
        for (const jobId of jobIds) {
            console.log(`  run ${runId}, job ${jobId}: fetching log...`)
            const log = gh(['api', `repos/${REPO}/actions/jobs/${jobId}/logs`])
            for (const { specFile, seconds } of parseDurations(log)) {
                if (!durationsBySpec.has(specFile)) {
                    durationsBySpec.set(specFile, [])
                }
                durationsBySpec.get(specFile).push(seconds)
            }
        }
    }

    const dataPath = path.join(__dirname, 'cypressFiles.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    const diffLines = []
    for (const [specPath, entry] of Object.entries(data)) {
        const samples = durationsBySpec.get(path.basename(specPath))
        if (!samples || samples.length === 0) {
            continue
        }

        const newDuration = median(samples)
        if (newDuration === entry.duration) {
            continue
        }

        diffLines.push(
            `  ${specPath}: ${entry.duration}s -> ${newDuration}s (n=${samples.length})`
        )
        entry.duration = newDuration
    }

    if (diffLines.length === 0) {
        console.log('\nNo duration changes found.')
        return
    }

    console.log('\nProposed duration changes:')
    diffLines.forEach((line) => console.log(line))

    if (WRITE) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4) + '\n')
        console.log(`\nWrote updated durations to ${dataPath}`)
    } else {
        console.log('\n(dry run - pass --write to apply these changes)')
    }
}

main()
