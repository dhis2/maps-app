const updateE2eComment = require('./e2e-comment.js')

const MARKER = '<!-- e2e-last-full-run -->'
const BOT = { login: 'dhis2-bot' }
const RUN_URL = 'https://github.com/dhis2/maps-app/actions/runs/9'
const NOW = new Date('2026-11-20T10:41:30Z')
const PASSED_LINE = `**Last full e2e run:** passed on \`aaaaaaa\`, 2026-11-20 10:41 UTC, base \`master\`. [Run](${RUN_URL})`
const SKIPPED_LINE =
    'Skipped on `bbbbbbb` (draft). Add the `e2e run` label for a one-off run.'

const botComment = (body) => ({ id: 42, user: BOT, body })

const createGithub = ({ comments = [], headSha } = {}) => ({
    paginate: jest.fn(async () => comments),
    rest: {
        pulls: {
            get: jest.fn(async () => ({ data: { head: { sha: headSha } } })),
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

// The run's commit is the PR's latest commit unless headSha says otherwise
const run = ({ comments, headSha, setupResult, e2eResult, ...pr }) => {
    const context = createContext(pr)
    const github = createGithub({
        comments,
        headSha: headSha ?? context.payload.pull_request.head.sha,
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
            body: [
                MARKER,
                '**Last full e2e run:** none yet.',
                'Skipped on `aaaaaaa` (draft). Add the `e2e run` label for a one-off run.',
            ].join('\n'),
        })
    })

    it('records a full run and clears the line about the latest commit', async () => {
        const issues = await run({
            comments: [
                { id: 5, user: { login: 'netlify' }, body: 'Deployed' },
                botComment(`${MARKER}\nold line\n${SKIPPED_LINE}`),
            ],
            draft: true,
            setupResult: 'success',
            e2eResult: 'success',
        })
        expect(issues.updateComment).toHaveBeenCalledWith({
            owner: 'dhis2',
            repo: 'maps-app',
            comment_id: 42,
            body: `${MARKER}\n${PASSED_LINE}\n`,
        })
    })

    it('records a failed full run', async () => {
        const issues = await run({
            sha: 'ddddddd4444',
            setupResult: 'success',
            e2eResult: 'failure',
        })
        expect(issues.createComment.mock.calls[0][0].body).toBe(
            `${MARKER}\n**Last full e2e run:** failed on \`ddddddd\`, 2026-11-20 10:41 UTC, base \`master\`. [Run](${RUN_URL})\n`
        )
    })

    it('keeps the last full run when a later commit is skipped', async () => {
        const issues = await run({
            comments: [botComment(`${MARKER}\n${PASSED_LINE}\n`)],
            sha: 'bbbbbbb2222',
            base: 'feat/DHIS2-21456-filter-model',
            setupResult: 'skipped',
            e2eResult: 'skipped',
        })
        expect(issues.updateComment.mock.calls[0][0].body).toBe(
            [
                MARKER,
                PASSED_LINE,
                "Skipped on `bbbbbbb` (base `feat/DHIS2-21456-filter-model` isn't `master`). Add the `e2e run` label for a one-off run.",
            ].join('\n')
        )
    })

    it.each([
        ['build, lint or test', 'success'],
        ['setup-matrix', 'failure'],
    ])('says e2e did not run when %s failed', async (_jobs, setupResult) => {
        const issues = await run({
            comments: [botComment(`${MARKER}\n${PASSED_LINE}\n`)],
            sha: 'ccccccc3333',
            setupResult,
            e2eResult: 'skipped',
        })
        expect(issues.updateComment.mock.calls[0][0].body).toBe(
            [
                MARKER,
                PASSED_LINE,
                'Not run on `ccccccc`: build, lint, test or setup-matrix failed.',
            ].join('\n')
        )
    })

    it('leaves the comment unchanged when a newer push cancelled the run', async () => {
        const issues = await run({
            comments: [botComment(`${MARKER}\n${PASSED_LINE}\n`)],
            setupResult: 'success',
            e2eResult: 'cancelled',
        })
        expect(issues.updateComment).not.toHaveBeenCalled()
        expect(issues.createComment).not.toHaveBeenCalled()
    })

    it('keeps the line about a newer commit when an older full run finishes last', async () => {
        const issues = await run({
            comments: [botComment(`${MARKER}\nold line\n${SKIPPED_LINE}`)],
            headSha: 'bbbbbbb2222',
            setupResult: 'success',
            e2eResult: 'success',
        })
        expect(issues.updateComment.mock.calls[0][0].body).toBe(
            [MARKER, PASSED_LINE, SKIPPED_LINE].join('\n')
        )
    })

    it('leaves the comment unchanged when a skipped run finishes after a newer push', async () => {
        const issues = await run({
            comments: [botComment(`${MARKER}\n${PASSED_LINE}\n`)],
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
            '**Last full e2e run:** none yet.'
        )
    })
})
