// Creates or updates the pull request comment that shows the last full e2e run, and whether the
// e2e tests ran on the latest commit. Called from verify-pr.yml through actions/github-script.
const MARKER = '<!-- e2e-last-full-run -->'
const TITLE =
    '**e2e tests** _(updated when a run finishes; live status in the checks)_'
const LATEST = 'Latest commit'
const LAST_RUN = 'Last full run'
const NO_RUN_LINE = `➖ ${LAST_RUN}: none yet.`

const formatDate = (date) =>
    `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`

const getSkipReason = (pr, defaultBranch) =>
    pr.draft ? 'draft' : `base \`${pr.base.ref}\` isn't \`${defaultBranch}\``

// Returns the lines this run changes, or null when it changes nothing.
// An empty latest line means the last full run is on the latest commit.
const getChanges = ({
    pr,
    defaultBranch,
    commitUrl,
    runUrl,
    setupResult,
    e2eResult,
    now,
}) => {
    const commit = `[\`${pr.head.sha.slice(0, 7)}\`](${commitUrl})`

    if (e2eResult === 'success' || e2eResult === 'failure') {
        const [icon, result] =
            e2eResult === 'success' ? ['✅', 'passed'] : ['❌', 'failed']
        return {
            lastRunLine: `${icon} ${LAST_RUN} ${commit}: ${result} (${formatDate(
                now
            )}, base \`${pr.base.ref}\`). [Run](${runUrl})`,
            latestLine: '',
        }
    }
    if (e2eResult === 'skipped' && setupResult === 'skipped') {
        return {
            latestLine: `⏭️ ${LATEST} ${commit}: skipped (${getSkipReason(
                pr,
                defaultBranch
            )}). Add the \`e2e run\` label for a one-off run.`,
        }
    }
    if (e2eResult === 'skipped') {
        return {
            latestLine: `⚠️ ${LATEST} ${commit}: not run (build, lint, test or setup-matrix failed).`,
        }
    }
    return null
}

const findLine = (lines, label) =>
    lines.find((line) => line.includes(label)) ?? ''

// A re-run of an older run, or one that finished late, must not replace a newer full run
const isAfterShownRun = async ({ github, owner, repo, shownLine, sha }) => {
    const shownSha = shownLine.match(/\/commit\/([0-9a-f]+)\)/)?.[1]
    if (!shownSha) {
        return true
    }
    const { data } = await github.rest.repos.compareCommits({
        owner,
        repo,
        base: shownSha,
        head: sha,
    })
    return data.status === 'ahead' || data.status === 'identical'
}

const updateE2eComment = async ({
    github,
    context,
    setupResult,
    e2eResult,
    now = new Date(),
}) => {
    const { owner, repo } = context.repo
    const pr = context.payload.pull_request

    const changes = getChanges({
        pr,
        defaultBranch: context.payload.repository.default_branch,
        commitUrl: `${context.serverUrl}/${owner}/${repo}/commit/${pr.head.sha}`,
        runUrl: `${context.serverUrl}/${owner}/${repo}/actions/runs/${context.runId}`,
        setupResult,
        e2eResult,
        now,
    })
    if (!changes) {
        console.log(`No comment update for e2e result '${e2eResult}'`)
        return
    }

    // A run that finishes after a newer push must not describe the latest commit
    const { data: currentPr } = await github.rest.pulls.get({
        owner,
        repo,
        pull_number: pr.number,
    })
    const isLatestCommit = currentPr.head.sha === pr.head.sha
    const newLatestLine = isLatestCommit ? changes.latestLine : undefined
    if (changes.lastRunLine === undefined && newLatestLine === undefined) {
        console.log(
            `No comment update: ${pr.head.sha} is no longer the latest commit`
        )
        return
    }

    const { data: bot } = await github.rest.users.getAuthenticated()
    const comments = await github.paginate(github.rest.issues.listComments, {
        owner,
        repo,
        issue_number: pr.number,
        per_page: 100,
    })
    const comment = comments.find(
        (c) => c.user?.login === bot.login && c.body?.startsWith(MARKER)
    )
    const lines = comment?.body.split('\n') ?? []
    const shownLastRunLine = findLine(lines, LAST_RUN)

    const replacesLastRun =
        changes.lastRunLine !== undefined &&
        (isLatestCommit ||
            (await isAfterShownRun({
                github,
                owner,
                repo,
                shownLine: shownLastRunLine,
                sha: pr.head.sha,
            })))
    if (!replacesLastRun && newLatestLine === undefined) {
        console.log(
            `No comment update: the comment shows a newer full run than ${pr.head.sha}`
        )
        return
    }

    const body = [
        MARKER,
        TITLE,
        newLatestLine ?? findLine(lines, LATEST),
        replacesLastRun ? changes.lastRunLine : shownLastRunLine || NO_RUN_LINE,
    ]
        .filter(Boolean)
        .join('\n')

    if (comment) {
        await github.rest.issues.updateComment({
            owner,
            repo,
            comment_id: comment.id,
            body,
        })
    } else {
        await github.rest.issues.createComment({
            owner,
            repo,
            issue_number: pr.number,
            body,
        })
    }
}

module.exports = updateE2eComment
