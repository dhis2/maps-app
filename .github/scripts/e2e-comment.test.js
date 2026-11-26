const updateE2eComment = require('./e2e-comment.js')

const MARKER = '<!-- e2e-last-full-run -->'
const TITLE =
    '**e2e tests** _(updated when a run finishes; live status in the checks)_'
const BOT = { login: 'dhis2-bot' }
const RUN_URL = 'https://github.com/dhis2/maps-app/actions/runs/9'
const NOW = new Date('2026-11-20T10:41:30Z')

// The commit the run tested, and commits before and after it on the pull request
const RUN_SHA = 'aaaaaaa1111'
const OLDER_SHA = '0000000aaaa'
const NEWER_SHA = 'bbbbbbb2222'

// --- Expected comment lines ---

const commitLink = (sha) =>
    `[\`${sha.slice(0, 7)}\`](https://github.com/dhis2/maps-app/commit/${sha})`

const passedLine = (sha, date = '2026-11-20 10:41') =>
    `✅ Last full run ${commitLink(
        sha
    )}: passed (${date} UTC, base \`master\`). [Run](${RUN_URL})`

const failedLine = (sha, date = '2026-11-20 10:41') =>
    `❌ Last full run ${commitLink(
        sha
    )}: failed (${date} UTC, base \`master\`). [Run](${RUN_URL})`

const NO_RUN_LINE = '➖ Last full run: none yet.'

const skippedLine = (sha, reason = 'draft') =>
    `⏭️ Latest commit ${commitLink(
        sha
    )}: skipped (${reason}). Add the \`e2e run\` label for a one-off run.`

const notRunLine = (sha) =>
    `⚠️ Latest commit ${commitLink(
        sha
    )}: not run (build, lint, test or setup-matrix failed).`

const comment = (...lines) => [MARKER, TITLE, ...lines].join('\n')

const botComment = (...lines) => ({
    id: 42,
    user: BOT,
    body: comment(...lines),
})

// --- Fake GitHub ---

const createGithub = ({ comments, headSha, compareStatus, saved }) => ({
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
            createComment: jest.fn(async ({ body }) => {
                saved.created = body
            }),
            updateComment: jest.fn(async ({ body }) => {
                saved.updated = body
            }),
        },
    },
})

const createContext = ({ draft, base }) => ({
    repo: { owner: 'dhis2', repo: 'maps-app' },
    serverUrl: 'https://github.com',
    runId: 9,
    payload: {
        repository: { default_branch: 'master' },
        pull_request: {
            number: 1,
            draft,
            head: { sha: RUN_SHA },
            base: { ref: base },
        },
    },
})

// headSha is the pull request's latest commit when the run finishes.
// compareStatus is how the run's commit compares with the one the comment shows.
// Returns the comment body saved ({ created } or { updated }, {} when unchanged) and the fake API.
const run = async ({
    comments = [],
    headSha = RUN_SHA,
    compareStatus,
    draft = false,
    base = 'master',
    setupResult,
    e2eResult,
}) => {
    const saved = {}
    const github = createGithub({ comments, headSha, compareStatus, saved })
    await updateE2eComment({
        github,
        context: createContext({ draft, base }),
        setupResult,
        e2eResult,
        now: NOW,
    })
    return { saved, issues: github.rest.issues }
}

describe('e2e comment', () => {
    describe('after a full run', () => {
        it.each([
            ['passed', 'success', passedLine],
            ['failed', 'failure', failedLine],
        ])(
            'records a %s full run on the latest commit and drops the latest commit line',
            async (_result, e2eResult, expectedLine) => {
                const { saved } = await run({
                    comments: [botComment(skippedLine(RUN_SHA), NO_RUN_LINE)],
                    setupResult: 'success',
                    e2eResult,
                })
                expect(saved).toEqual({
                    updated: comment(expectedLine(RUN_SHA)),
                })
            }
        )

        it('creates the comment without a latest commit line when an older full run finishes last', async () => {
            const { saved } = await run({
                headSha: NEWER_SHA,
                setupResult: 'success',
                e2eResult: 'success',
            })
            expect(saved).toEqual({ created: comment(passedLine(RUN_SHA)) })
        })

        it('keeps the line about a newer commit when an older full run finishes last', async () => {
            const { saved } = await run({
                comments: [botComment(skippedLine(NEWER_SHA), NO_RUN_LINE)],
                headSha: NEWER_SHA,
                setupResult: 'success',
                e2eResult: 'success',
            })
            expect(saved).toEqual({
                updated: comment(skippedLine(NEWER_SHA), passedLine(RUN_SHA)),
            })
        })

        it.each([
            ['newer than', 'ahead'],
            ['the same as', 'identical'],
        ])(
            'replaces the last full run with an older commit run %s the one shown',
            async (_relation, compareStatus) => {
                const { saved } = await run({
                    comments: [
                        botComment(
                            skippedLine(NEWER_SHA),
                            failedLine(OLDER_SHA, '2026-11-19 08:00')
                        ),
                    ],
                    headSha: NEWER_SHA,
                    compareStatus,
                    setupResult: 'success',
                    e2eResult: 'success',
                })
                expect(saved).toEqual({
                    updated: comment(
                        skippedLine(NEWER_SHA),
                        passedLine(RUN_SHA)
                    ),
                })
            }
        )

        it.each([
            ['an older commit is re-run', 'behind'],
            ['a run from before a force push finishes late', 'diverged'],
        ])('keeps a newer full run when %s', async (_case, compareStatus) => {
            const { saved } = await run({
                comments: [
                    botComment(passedLine(NEWER_SHA, '2026-11-20 09:00')),
                ],
                headSha: NEWER_SHA,
                compareStatus,
                setupResult: 'success',
                e2eResult: 'failure',
            })
            expect(saved).toEqual({})
        })
    })

    describe('after a run without e2e tests', () => {
        it('creates the comment on a draft without a full run yet', async () => {
            const { saved } = await run({
                draft: true,
                setupResult: 'skipped',
                e2eResult: 'skipped',
            })
            expect(saved).toEqual({
                created: comment(skippedLine(RUN_SHA), NO_RUN_LINE),
            })
        })

        it('keeps the last full run when a later commit is skipped', async () => {
            const { saved } = await run({
                comments: [botComment(passedLine(OLDER_SHA))],
                base: 'feat/DHIS2-21456-filter-model',
                setupResult: 'skipped',
                e2eResult: 'skipped',
            })
            expect(saved).toEqual({
                updated: comment(
                    skippedLine(
                        RUN_SHA,
                        "base `feat/DHIS2-21456-filter-model` isn't `master`"
                    ),
                    passedLine(OLDER_SHA)
                ),
            })
        })

        it.each([
            ['build, lint or test', 'success'],
            ['setup-matrix', 'failure'],
        ])(
            'says e2e did not run when %s failed',
            async (_jobs, setupResult) => {
                const { saved } = await run({
                    comments: [botComment(passedLine(OLDER_SHA))],
                    setupResult,
                    e2eResult: 'skipped',
                })
                expect(saved).toEqual({
                    updated: comment(
                        notRunLine(RUN_SHA),
                        passedLine(OLDER_SHA)
                    ),
                })
            }
        )

        it.each([
            ['skipped', 'skipped'],
            ['not run', 'failure'],
        ])(
            'leaves the comment unchanged when a %s run finishes after a newer push',
            async (_case, setupResult) => {
                const { saved } = await run({
                    comments: [botComment(passedLine(OLDER_SHA))],
                    headSha: NEWER_SHA,
                    draft: true,
                    setupResult,
                    e2eResult: 'skipped',
                })
                expect(saved).toEqual({})
            }
        )
    })

    it.each([
        ['was cancelled', 'cancelled'],
        ['has an empty result', ''],
        ['has no result', undefined],
    ])(
        'leaves the comment unchanged when the e2e run %s',
        async (_case, e2eResult) => {
            const { saved } = await run({
                comments: [botComment(passedLine(OLDER_SHA))],
                setupResult: 'success',
                e2eResult,
            })
            expect(saved).toEqual({})
        }
    )

    describe('finding the comment', () => {
        it('creates the comment on the pull request', async () => {
            const { issues } = await run({
                draft: true,
                setupResult: 'skipped',
                e2eResult: 'skipped',
            })
            expect(issues.createComment).toHaveBeenCalledWith({
                owner: 'dhis2',
                repo: 'maps-app',
                issue_number: 1,
                body: comment(skippedLine(RUN_SHA), NO_RUN_LINE),
            })
        })

        it("updates the bot's comment among others", async () => {
            const { issues } = await run({
                comments: [
                    { id: 5, user: { login: 'netlify' }, body: 'Deployed' },
                    botComment(skippedLine(RUN_SHA), NO_RUN_LINE),
                ],
                setupResult: 'success',
                e2eResult: 'success',
            })
            expect(issues.updateComment).toHaveBeenCalledWith({
                owner: 'dhis2',
                repo: 'maps-app',
                comment_id: 42,
                body: comment(passedLine(RUN_SHA)),
            })
        })

        it('ignores a comment by someone else that starts with the marker', async () => {
            const { saved } = await run({
                comments: [
                    {
                        id: 7,
                        user: { login: 'someone' },
                        body: `${MARKER}\nquote`,
                    },
                ],
                draft: true,
                setupResult: 'skipped',
                e2eResult: 'skipped',
            })
            expect(saved).toEqual({
                created: comment(skippedLine(RUN_SHA), NO_RUN_LINE),
            })
        })
    })
})
