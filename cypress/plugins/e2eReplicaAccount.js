const crypto = require('node:crypto')

const MAX_REPLICA_CREATE_ATTEMPTS = 3

const uniqueId = () => `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

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

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    const responseBody = await response.json().catch(() => null)

    return { status: response.status, body: responseBody }
}

const createReplicaUser = async ({ baseUrl, adminId, auth }, attempt = 1) => {
    const username = `e2e_${uniqueId().replaceAll('-', '_')}`
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

    if (replicaUserId) {
        return { username, password, replicaUserId }
    }
    if (attempt >= MAX_REPLICA_CREATE_ATTEMPTS) {
        throw new Error(
            `Failed to create e2e replica user after ${attempt} attempts (last tried '${username}')`
        )
    }

    return createReplicaUser({ baseUrl, adminId, auth }, attempt + 1)
}

const createReplicaAccountForRun = async ({ baseUrl, username, password }) => {
    const auth = { username, password }
    const me = await dhis2Fetch(baseUrl, '/api/me', { auth })
    const adminId = me.body?.id

    if (!adminId) {
        throw new Error(
            'Could not resolve the admin user id for e2e replica account creation'
        )
    }

    return createReplicaUser({ baseUrl, adminId, auth })
}

const deleteReplicaAccount = async ({
    baseUrl,
    username,
    password,
    replicaUserId,
}) => {
    const response = await dhis2Fetch(baseUrl, `/api/users/${replicaUserId}`, {
        method: 'DELETE',
        auth: { username, password },
    })

    if (response.status < 200 || response.status >= 300) {
        console.warn(
            `WARNING: failed to delete e2e replica user ${replicaUserId} (status ${response.status}) - it may need manual cleanup`
        )
    }
}

module.exports = { createReplicaAccountForRun, deleteReplicaAccount }
