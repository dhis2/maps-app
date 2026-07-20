/*
 * Creates a per-CI-job replica admin user at run start and deletes it at run
 * end, so parallel jobs against the same shared DHIS2 instance don't collide
 * on a single shared account. Username embeds the CI run id for traceability.
 *
 * waitForBackendReady retries only network-level failures or 5xx responses
 * (the backend plausibly still starting up); a 4xx is definitive and fails
 * immediately instead of retrying.
 *
 * createReplicaUser is a single attempt once the backend is confirmed ready
 * - it either works or it doesn't.
 *
 * deleteReplicaAccount retries with backoff: reproduced directly against the
 * live test instance, some deletion failures are transient and resolve given
 * time, which a single attempt can't take advantage of.
 *
 * If account creation fails outright, cypress.config.js catches it and falls
 * back to running the job under the standard shared account instead of
 * failing the whole run.
 */
const crypto = require('node:crypto')

const MAX_BACKEND_READY_ATTEMPTS = 5
const BACKEND_READY_RETRY_DELAY_MS = 3000
const MAX_REPLICA_DELETE_ATTEMPTS = 3
const REPLICA_DELETE_RETRY_DELAY_MS = 3000

const uniqueId = () => `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const dhis2Fetch = async (
    baseUrl,
    path,
    { method = 'GET', auth, body, qs } = {}
) => {
    const url = new URL(`${baseUrl}${path}`)
    if (qs) {
        Object.entries(qs).forEach(([key, value]) =>
            url.searchParams.set(key, value)
        )
    }

    const headers = { 'Content-Type': 'application/json' }
    if (auth) {
        headers.Authorization = `Basic ${Buffer.from(
            `${auth.username}:${auth.password}`
        ).toString('base64')}`
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        })
        const responseBody = await response.json().catch(() => null)

        return { status: response.status, body: responseBody }
    } catch (error) {
        return { status: 0, body: { message: error.message } }
    }
}

const buildReplicaUsername = () =>
    `e2e_mapsapp_run${
        process.env.GITHUB_RUN_ID ?? 'local'
    }_${uniqueId().replaceAll('-', '_')}`

const createReplicaUser = async ({ baseUrl, adminId, auth }) => {
    const username = buildReplicaUsername()
    const password = `Aa1!${uniqueId()}`

    await dhis2Fetch(baseUrl, `/api/users/${adminId}/replica`, {
        method: 'POST',
        auth,
        body: { username, password },
    })

    const lookup = await dhis2Fetch(baseUrl, '/api/users', {
        auth,
        qs: { filter: `username:eq:${username}`, fields: 'id' },
    })
    const replicaUserId = lookup.body?.users?.[0]?.id

    if (!replicaUserId) {
        throw new Error(
            `Failed to create e2e replica user '${username}' - lookup did not find it after creation`
        )
    }

    return { username, password, replicaUserId }
}

const waitForBackendReady = async ({ baseUrl, auth }, attempt = 1) => {
    const response = await dhis2Fetch(baseUrl, '/api/system/info', { auth })

    if (response.status >= 200 && response.status < 300) {
        return
    }

    const isRetryable = response.status === 0 || response.status >= 500
    if (!isRetryable || attempt >= MAX_BACKEND_READY_ATTEMPTS) {
        throw new Error(
            `Backend at ${baseUrl} is not ready (status ${response.status}, attempt ${attempt})`
        )
    }

    await wait(BACKEND_READY_RETRY_DELAY_MS)
    return waitForBackendReady({ baseUrl, auth }, attempt + 1)
}

const createReplicaAccountForRun = async ({ baseUrl, username, password }) => {
    const auth = { username, password }
    await waitForBackendReady({ baseUrl, auth })
    const me = await dhis2Fetch(baseUrl, '/api/me', { auth })
    const adminId = me.body?.id

    if (!adminId) {
        throw new Error(
            'Could not resolve the admin user id for e2e replica account creation'
        )
    }

    return createReplicaUser({ baseUrl, adminId, auth })
}

const deleteReplicaAccount = async (
    { baseUrl, username, password, replicaUserId },
    attempt = 1
) => {
    const response = await dhis2Fetch(baseUrl, `/api/users/${replicaUserId}`, {
        method: 'DELETE',
        auth: { username, password },
    })

    if (response.status >= 200 && response.status < 300) {
        if (attempt > 1) {
            console.log(
                `Deleted e2e replica user ${replicaUserId} on attempt ${attempt} after ${
                    attempt - 1
                } prior failure(s)`
            )
        }
        return
    }

    console.warn(
        `WARNING: attempt ${attempt}/${MAX_REPLICA_DELETE_ATTEMPTS} to delete e2e replica user ${replicaUserId} failed (status ${response.status})`,
        JSON.stringify(response.body)
    )

    if (attempt < MAX_REPLICA_DELETE_ATTEMPTS) {
        await wait(REPLICA_DELETE_RETRY_DELAY_MS)
        return deleteReplicaAccount(
            { baseUrl, username, password, replicaUserId },
            attempt + 1
        )
    }

    console.warn(
        `WARNING: e2e replica user ${replicaUserId} could not be deleted after ${attempt} attempts - it may need manual cleanup`
    )
}

module.exports = { createReplicaAccountForRun, deleteReplicaAccount }
