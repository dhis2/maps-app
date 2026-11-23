const updateE2eComment = require('./e2e-comment.js')

const MARKER = '<!-- e2e-last-full-run -->'
const TITLE =
    '**e2e tests** _(updated when a run finishes; live status in the checks)_'
const BOT = { login: 'dhis2-bot' }
const RUN_URL = 'https://github.com/dhis2/maps-app/actions/runs/9'
const NOW = new Date('2026-11-20T10:41:30Z')

const commit = (sha) =>
    `[\`${sha.slice(0, 7)}\`](https://github.com/dhis2/maps-app/commit/${sha})`
const PASSED_LINE = `✅ Last full run ${commit(
    'aaaaaaa1111'
)}: passed (2026-11-20 10:41 UTC, base \`master\`). [Run](${RUN_URL})`
const OLDER_FAILED_LINE = `❌ Last full run ${commit(
    '0000000aaaa'
)}: failed (2026-11-19 08:00 UTC, base \`master\`). [Run](${RUN_URL})`
const NEWER_PASSED_LINE = `✅ Last full run ${commit(
    'bbbbbbb2222'
)}: passed (2026-11-20 09:00 UTC, base \`master\`). [Run](${RUN_URL})`
const NO_RUN_LINE = '➖ Last full run: none yet.'
const SKIPPED_LINE = `⏭️ Latest commit ${commit(
    'bbbbbbb2222'
)}: skipped (draft). Add the \`e2e run\` label for a one-off run.`

const comment = (...lines) => [MARKER, TITLE, ...lines].join('\n')
const botComment = (...lines) => ({
    id: 42,
    user: BOT,
    body: comment(...lines),
})

const createGithub = ({ comments = [], headSha, compareStatus } = {}) => ({
    paginate: jest.fn(async () => comments),
    rest: {
        pulls: {
            get: jest.fn(async () => ({ data: { head: { sha: headSha } } })),
        },
        repos: {
            compareCommits: jest.fn(async () => ({
                data: { status: compareStatus },
            })),
        },
        users: { getAuthenticated: jest.fn(async () => ({ data: BOT })) },
        issues: {
            listComments: 'listComments',
            createComment: jest.fn(),
            updateComment: jest.fn(),
        },
    },
})

const createContext = ({
    sha = 'aaaaaaa1111',
    draft = false,
    base = 'master',
}) => ({
    repo: { owner: 'dhis2', repo: 'maps-app' },
    serverUrl: 'https://github.com',
    runId: 9,
    payload: {
        repository: { default_branch: 'master' },
        pull_request: { number: 1, draft, head: { sha }, base: { ref: base } },
    },
})

// The run's commit is the pull request's latest commit unless headSha says otherwise.
// compareStatus is how the run's commit compares with the one the comment shows.
const run = ({
    comments,
    headSha,
    compareStatus,
    setupResult,
    e2eResult,
    ...pr
}) => {
    const context = createContext(pr)
    const github = createGithub({
        comments,
        headSha: headSha ?? context.payload.pull_request.head.sha,
        compareStatus,
    })
    return updateE2eComment({
        github,
        context,
        setupResult,
        e2eResult,
        now: NOW,
    }).then(() => github.rest.issues)
}

describe('e2e comment', () => {
    it('creates the comment on a draft without a full run yet', async () => {
        const issues = await run({
            draft: true,
            setupResult: 'skipped',
            e2eResult: 'skipped',
        })
        expect(issues.createComment).toHaveBeenCalledWith({
            owner: 'dhis2',
            repo: 'maps-app',
            issue_number: 1,
            body: comment(
                `⏭️ Latest commit ${commit(
                    'aaaaaaa1111'
                )}: skipped (draft). Add the \`e2e run\` label for a one-off run.`,
                NO_RUN_LINE
            ),
        })
    })

    it('records a full run on the latest commit and drops the latest commit line', async () => {
        const issues = await run({
            comments: [
                { id: 5, user: { login: 'netlify' }, body: 'Deployed' },
                botComment(SKIPPED_LINE, NO_RUN_LINE),
            ],
            draft: true,
            setupResult: 'success',
            e2eResult: 'success',
        })
        expect(issues.updateComment).toHaveBeenCalledWith({
            owner: 'dhis2',
            repo: 'maps-app',
            comment_id: 42,
            body: comment(PASSED_LINE),
        })
    })

    it('records a failed full run', async () => {
        const issues = await run({
            sha: 'ddddddd4444',
            setupResult: 'success',
            e2eResult: 'failure',
        })
        expect(issues.createComment.mock.calls[0][0].body).toBe(
            comment(
                `❌ Last full run ${commit(
                    'ddddddd4444'
                )}: failed (2026-11-20 10:41 UTC, base \`master\`). [Run](${RUN_URL})`
            )
        )
    })

    it('keeps the last full run when a later commit is skipped', async () => {
        const issues = await run({
            comments: [botComment(PASSED_LINE)],
            sha: 'bbbbbbb2222',
            base: 'feat/DHIS2-21456-filter-model',
            setupResult: 'skipped',
            e2eResult: 'skipped',
        })
        expect(issues.updateComment.mock.calls[0][0].body).toBe(
            comment(
                `⏭️ Latest commit ${commit(
                    'bbbbbbb2222'
                )}: skipped (base \`feat/DHIS2-21456-filter-model\` isn't \`master\`). Add the \`e2e run\` label for a one-off run.`,
                PASSED_LINE
            )
        )
    })

    it.each([
        ['build, lint or test', 'success'],
        ['setup-matrix', 'failure'],
    ])('says e2e did not run when %s failed', async (_jobs, setupResult) => {
        const issues = await run({
            comments: [botComment(PASSED_LINE)],
            sha: 'ccccccc3333',
            setupResult,
            e2eResult: 'skipped',
        })
        expect(issues.updateComment.mock.calls[0][0].body).toBe(
            comment(
                `⚠️ Latest commit ${commit(
                    'ccccccc3333'
                )}: not run (build, lint, test or setup-matrix failed).`,
                PASSED_LINE
            )
        )
    })

    it('leaves the comment unchanged when the e2e run was cancelled', async () => {
        const issues = await run({
            comments: [botComment(PASSED_LINE)],
            setupResult: 'success',
            e2eResult: 'cancelled',
        })
        expect(issues.updateComment).not.toHaveBeenCalled()
        expect(issues.createComment).not.toHaveBeenCalled()
    })

    it('keeps the line about a newer commit when an older full run finishes last', async () => {
        const issues = await run({
            comments: [botComment(SKIPPED_LINE, NO_RUN_LINE)],
            headSha: 'bbbbbbb2222',
            setupResult: 'success',
            e2eResult: 'success',
        })
        expect(issues.updateComment.mock.calls[0][0].body).toBe(
            comment(SKIPPED_LINE, PASSED_LINE)
        )
    })

    it.each([
        ['newer than', 'ahead'],
        ['the same as', 'identical'],
    ])(
        'replaces the last full run with an older commit run %s the one shown',
        async (_relation, compareStatus) => {
            const issues = await run({
                comments: [botComment(SKIPPED_LINE, OLDER_FAILED_LINE)],
                headSha: 'bbbbbbb2222',
                compareStatus,
                setupResult: 'success',
                e2eResult: 'success',
            })
            expect(issues.updateComment.mock.calls[0][0].body).toBe(
                comment(SKIPPED_LINE, PASSED_LINE)
            )
        }
    )

    it('keeps a newer full run when an older commit is re-run', async () => {
        const issues = await run({
            comments: [botComment(NEWER_PASSED_LINE)],
            headSha: 'bbbbbbb2222',
            compareStatus: 'behind',
            setupResult: 'success',
            e2eResult: 'failure',
        })
        expect(issues.updateComment).not.toHaveBeenCalled()
        expect(issues.createComment).not.toHaveBeenCalled()
    })

    it('leaves the comment unchanged when a skipped run finishes after a newer push', async () => {
        const issues = await run({
            comments: [botComment(PASSED_LINE)],
            headSha: 'ccccccc3333',
            draft: true,
            setupResult: 'skipped',
            e2eResult: 'skipped',
        })
        expect(issues.updateComment).not.toHaveBeenCalled()
        expect(issues.createComment).not.toHaveBeenCalled()
    })

    it('ignores a comment by someone else that starts with the marker', async () => {
        const issues = await run({
            comments: [
                { id: 7, user: { login: 'someone' }, body: `${MARKER}\nquote` },
            ],
            draft: true,
            setupResult: 'skipped',
            e2eResult: 'skipped',
        })
        expect(issues.updateComment).not.toHaveBeenCalled()
        expect(issues.createComment.mock.calls[0][0].body).toContain(
            NO_RUN_LINE
        )
    })
})
