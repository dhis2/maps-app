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
// Requires a GH_TOKEN or GITHUB_TOKEN env var with `repo` (or public-repo)
// scope - e.g. `export GH_TOKEN=$(gh auth token)` if you use the gh CLI.

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

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
if (!TOKEN) {
    console.error(
        'Missing GH_TOKEN/GITHUB_TOKEN env var.\n' +
            'If you use the gh CLI, run: export GH_TOKEN=$(gh auth token)'
    )
    process.exit(1)
}

const githubApi = async (apiPath) => {
    const res = await fetch(`https://api.github.com${apiPath}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
    })
    if (!res.ok) {
        throw new Error(
            `GitHub API ${apiPath} failed: ${res.status} ${res.statusText}`
        )
    }
    return res
}

const listSuccessfulRunIds = async () => {
    const res = await githubApi(
        `/repos/${REPO}/actions/workflows/${WORKFLOW}/runs` +
            `?status=success&per_page=${NUM_RUNS}`
    )
    const { workflow_runs: runs } = await res.json()
    return runs.map((run) => run.id)
}

const listE2eJobIds = async (runId) => {
    const res = await githubApi(
        `/repos/${REPO}/actions/runs/${runId}/jobs?per_page=100`
    )
    const { jobs } = await res.json()
    return jobs
        .filter((job) => job.name.includes('call-workflow-e2e-prod'))
        .map((job) => job.id)
}

const fetchJobLog = async (jobId) => {
    const res = await githubApi(`/repos/${REPO}/actions/jobs/${jobId}/logs`)
    return res.text()
}

// GH Actions logs are colorized; strip ANSI codes first since they embed
// digits (e.g. "\x1b[90m") that would otherwise break the summary-row match
// eslint-disable-next-line no-control-regex
const ANSI_CODE = /\x1b\[[0-9;]*m/g
const stripAnsi = (str) => str.replace(ANSI_CODE, '')
const SUMMARY_ROW = /([\w-]{1,80}\.cy\.js)\s{1,120}(\d{2}):(\d{2})\s/

const parseDurations = (log) => {
    const results = []
    for (const rawLine of stripAnsi(log).split('\n')) {
        const match = SUMMARY_ROW.exec(rawLine)
        if (!match) {
            continue
        }
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

const addSample = (durationsBySpec, specFile, seconds) => {
    if (!durationsBySpec.has(specFile)) {
        durationsBySpec.set(specFile, [])
    }
    durationsBySpec.get(specFile).push(seconds)
}

const collectDurationsFromRuns = async (runIds) => {
    const durationsBySpec = new Map()

    for (const runId of runIds) {
        const jobIds = await listE2eJobIds(runId)
        // A run that just flipped to "success" can briefly report an
        // incomplete job list (GitHub API replication lag) - logging the
        // count makes a suspiciously low number (e.g. 1 instead of ~15)
        // visible instead of silently under-sampling.
        console.log(`  run ${runId}: ${jobIds.length} e2e job(s)`)
        for (const jobId of jobIds) {
            const log = await fetchJobLog(jobId)
            for (const { specFile, seconds } of parseDurations(log)) {
                addSample(durationsBySpec, specFile, seconds)
            }
        }
    }

    return durationsBySpec
}

// Returns a human-readable diff line per changed entry, plus the list of
// included-but-unsampled specs - these are left untouched, which looks
// identical to "already correct" unless called out explicitly.
const applyDurationUpdates = (data, durationsBySpec) => {
    const diffLines = []
    const missingData = []

    for (const [specPath, entry] of Object.entries(data)) {
        const samples = durationsBySpec.get(path.basename(specPath))
        if (!samples || samples.length === 0) {
            if (entry.include) {
                missingData.push(specPath)
            }
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

    return { diffLines, missingData }
}

const main = async () => {
    console.log(
        `Fetching last ${NUM_RUNS} successful "${WORKFLOW}" runs from ${REPO}...`
    )
    const runIds = await listSuccessfulRunIds()
    const durationsBySpec = await collectDurationsFromRuns(runIds)

    const dataPath = path.join(__dirname, 'cypressFiles.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    const { diffLines, missingData } = applyDurationUpdates(
        data,
        durationsBySpec
    )

    if (missingData.length > 0) {
        console.warn(
            `\nWARNING: no samples found for ${missingData.length} included spec(s) - their durations were NOT refreshed:`
        )
        missingData.forEach((specPath) => console.warn(`  ${specPath}`))
        console.warn(
            'This usually means a sampled run had an incomplete job list ' +
                '(see the per-run job counts above) or --runs was too low. ' +
                "Don't treat this as a full refresh until that count looks right."
        )
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

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
