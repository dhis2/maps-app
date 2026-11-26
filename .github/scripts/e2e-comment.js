// Creates or updates the pull request comment that shows the last full e2e run, and whether the
// e2e tests ran on the latest commit. Called from verify-pr.yml through actions/github-script.
//
// The comment has two fixed lines, then two status lines that each run may change:
//
//   <!-- e2e-last-full-run -->                                      MARKER (hidden)
//   **e2e tests** _(updated when a run finishes; …)_                TITLE
//   ⏭️ Latest commit `7d086dc`: skipped (draft). Add the …          latestCommitLine, left out when the last full run is on it
//   ✅ Last full run `d404783`: passed (2026-11-24 15:48 UTC, …)    lastFullRunLine, or "➖ Last full run: none yet."

// --- Comment text ---

const MARKER = '<!-- e2e-last-full-run -->'
const TITLE =
    '**e2e tests** _(updated when a run finishes; live status in the checks)_'
const LATEST_COMMIT = 'Latest commit'
const LAST_FULL_RUN = 'Last full run'
const NO_FULL_RUN_LINE = `➖ ${LAST_FULL_RUN}: none yet.`

// --- Reading and writing the comment ---

const formatDate = (date) =>
    `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`

const formatCommitLink = (repoUrl, sha) =>
    `[\`${sha.slice(0, 7)}\`](${repoUrl}/commit/${sha})`

const formatLatestCommitLine = (run) => {
    if (run.setupResult !== 'skipped') {
        return `⚠️ ${LATEST_COMMIT} ${run.commitLink}: not run (build, lint, test or setup-matrix failed).`
    }
    const reason = run.isDraft
        ? 'draft'
        : `base \`${run.baseBranch}\` isn't \`${run.defaultBranch}\``
    return `⏭️ ${LATEST_COMMIT} ${run.commitLink}: skipped (${reason}). Add the \`e2e run\` label for a one-off run.`
}

const formatLastFullRunLine = (run) => {
    const [icon, result] =
        run.e2eResult === 'success' ? ['✅', 'passed'] : ['❌', 'failed']
    const date = formatDate(run.finishedAt)
    return `${icon} ${LAST_FULL_RUN} ${run.commitLink}: ${result} (${date}, base \`${run.baseBranch}\`). [Run](${run.url})`
}

const formatComment = ({ latestCommitLine, lastFullRunLine }) =>
    [MARKER, TITLE, latestCommitLine, lastFullRunLine]
        .filter(Boolean)
        .join('\n')

const parseComment = (body = '') => {
    const lines = body.split('\n')
    const findLine = (label) => lines.find((line) => line.includes(label)) ?? ''
    return {
        latestCommitLine: findLine(LATEST_COMMIT),
        lastFullRunLine: findLine(LAST_FULL_RUN),
    }
}

const parseCommitSha = (line) => line.match(/\/commit\/([0-9a-f]+)\)/)?.[1]

const getStatusLines = ({ run, shownStatusLines, isLatestCommit }) => {
    if (!run.isFullRun) {
        return {
            latestCommitLine: formatLatestCommitLine(run),
            lastFullRunLine:
                shownStatusLines.lastFullRunLine || NO_FULL_RUN_LINE,
        }
    }
    return {
        latestCommitLine: isLatestCommit
            ? ''
            : shownStatusLines.latestCommitLine,
        lastFullRunLine: formatLastFullRunLine(run),
    }
}

// --- GitHub API ---

const createApi = ({ github, owner, repo, prNumber }) => ({
    getHeadSha: async () => {
        const { data } = await github.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
        })
        return data.head.sha
    },

    // Only the bot's own comment, since anyone can post one that starts with the marker
    findBotComment: async () => {
        const { data: bot } = await github.rest.users.getAuthenticated()
        const comments = await github.paginate(
            github.rest.issues.listComments,
            { owner, repo, issue_number: prNumber, per_page: 100 }
        )
        return comments.find(
            (c) => c.user?.login === bot.login && c.body?.startsWith(MARKER)
        )
    },

    isBehindOrDiverged: async (sha, fromSha) => {
        const { data } = await github.rest.repos.compareCommits({
            owner,
            repo,
            base: fromSha,
            head: sha,
        })
        return data.status !== 'ahead' && data.status !== 'identical'
    },

    saveComment: (comment, body) =>
        comment
            ? github.rest.issues.updateComment({
                  owner,
                  repo,
                  comment_id: comment.id,
                  body,
              })
            : github.rest.issues.createComment({
                  owner,
                  repo,
                  issue_number: prNumber,
                  body,
              }),
})

// --- Entry point ---

const updateE2eComment = async ({
    github,
    context,
    setupResult,
    e2eResult,
    now = new Date(),
}) => {
    const { owner, repo } = context.repo
    const pr = context.payload.pull_request
    const repoUrl = `${context.serverUrl}/${owner}/${repo}`
    const api = createApi({ github, owner, repo, prNumber: pr.number })
    const run = {
        sha: pr.head.sha,
        commitLink: formatCommitLink(repoUrl, pr.head.sha),
        url: `${repoUrl}/actions/runs/${context.runId}`,
        isFullRun: e2eResult === 'success' || e2eResult === 'failure',
        isDraft: pr.draft,
        baseBranch: pr.base.ref,
        defaultBranch: context.payload.repository.default_branch,
        setupResult,
        e2eResult,
        finishedAt: now,
    }

    if (!run.isFullRun && e2eResult !== 'skipped') {
        console.log(`No comment update for e2e result '${e2eResult}'`)
        return
    }

    const isLatestCommit = (await api.getHeadSha()) === run.sha
    if (!run.isFullRun && !isLatestCommit) {
        console.log(
            `No comment update: ${run.sha} is no longer the latest commit`
        )
        return
    }

    const comment = await api.findBotComment()
    const shownStatusLines = parseComment(comment?.body)

    // A run on an older commit (re-run, late finish, or from before a force push) must not
    // replace a newer full run
    const shownSha = parseCommitSha(shownStatusLines.lastFullRunLine)
    const isShownRunNewer =
        run.isFullRun &&
        !isLatestCommit &&
        shownSha !== undefined &&
        (await api.isBehindOrDiverged(run.sha, shownSha))
    if (isShownRunNewer) {
        console.log(
            `No comment update: the comment shows a newer full run than ${run.sha}`
        )
        return
    }

    const statusLines = getStatusLines({
        run,
        shownStatusLines,
        isLatestCommit,
    })
    await api.saveComment(comment, formatComment(statusLines))
}

module.exports = updateE2eComment
