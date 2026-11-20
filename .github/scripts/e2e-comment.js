// Creates or updates the PR comment that shows the last full e2e run, and whether e2e ran on the
// latest commit. Called from verify-pr.yml through actions/github-script.
const MARKER = '<!-- e2e-last-full-run -->'
const NO_RUN_LINE = '**Last full e2e run:** none yet.'

const formatDate = (date) =>
    `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`

const getSkipReason = (pr, defaultBranch) =>
    pr.draft ? 'draft' : `base \`${pr.base.ref}\` isn't \`${defaultBranch}\``

// Returns the lines this run changes, or null when it changes nothing
const getChanges = ({
    pr,
    defaultBranch,
    runUrl,
    setupResult,
    e2eResult,
    now,
}) => {
    const sha = pr.head.sha.slice(0, 7)

    if (e2eResult === 'success' || e2eResult === 'failure') {
        const outcome = e2eResult === 'success' ? 'passed' : 'failed'
        return {
            lastRunLine: `**Last full e2e run:** ${outcome} on \`${sha}\`, ${formatDate(
                now
            )}, base \`${pr.base.ref}\`. [Run](${runUrl})`,
            latestLine: '',
        }
    }
    if (e2eResult === 'skipped' && setupResult === 'skipped') {
        return {
            latestLine: `Skipped on \`${sha}\` (${getSkipReason(
                pr,
                defaultBranch
            )}). Add the \`e2e run\` label for a one-off run.`,
        }
    }
    if (e2eResult === 'skipped') {
        return {
            latestLine: `Not run on \`${sha}\`: build, lint, test or setup-matrix failed.`,
        }
    }
    return null
}

module.exports = async ({
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
    const newLatestLine =
        currentPr.head.sha === pr.head.sha ? changes.latestLine : undefined
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
    const [, lastRunLine = '', latestLine = ''] =
        comment?.body.split('\n') ?? []

    const body = [
        MARKER,
        changes.lastRunLine ?? (lastRunLine || NO_RUN_LINE),
        newLatestLine ?? latestLine,
    ].join('\n')

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
