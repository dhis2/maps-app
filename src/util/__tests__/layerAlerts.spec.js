import {
    LAYER_ALERT_LOAD_FAILED,
    LAYER_ALERT_NO_DATA,
    LAYER_ALERT_TRACKED_ENTITIES_TRUNCATED,
} from '../../constants/layerAlerts.js'
import {
    createLayerAlert,
    createLayerAlertFromError,
    formatAlertDetails,
    getLayerAlerts,
    getMostSevereAlert,
    hasLayerError,
    isLayerAlert,
    sortBySeverity,
    throwWithRequest,
} from '../layerAlerts.js'

const fetchError = (details, type = 'unknown') =>
    Object.assign(new Error(details.message ?? 'Server error'), {
        type,
        details,
    })

describe('createLayerAlert', () => {
    it('builds an alert from the catalog', () => {
        expect(
            createLayerAlert(LAYER_ALERT_TRACKED_ENTITIES_TRUNCATED, {
                params: { limit: '50,000' },
            })
        ).toEqual({
            id: 'TRACKED_ENTITIES_TRUNCATED',
            severity: 'warning',
            title: 'Showing the first 50,000 tracked entities',
            description: 'Narrow the period or org units to see all of them.',
        })
    })

    it('adds details when given', () => {
        expect(
            createLayerAlert(LAYER_ALERT_LOAD_FAILED, {
                details: { message: 'Boom' },
            })
        ).toMatchObject({
            severity: 'error',
            details: { message: 'Boom' },
        })
    })
})

describe('createLayerAlertFromError', () => {
    it('maps access errors', () => {
        expect(
            createLayerAlertFromError(
                fetchError({ httpStatusCode: 403 }, 'access')
            ).id
        ).toBe('NO_ACCESS')
        expect(
            createLayerAlertFromError(fetchError({ httpStatusCode: 403 })).id
        ).toBe('NO_ACCESS')
    })

    it('maps known error codes, and keeps the server details', () => {
        const error = fetchError({
            httpStatusCode: 409,
            errorCode: 'E7129',
            message: 'Program is specified but does not exist',
        })
        error.request = 'analytics/trackedEntities/query'

        const alert = createLayerAlertFromError(error)

        expect(alert).toMatchObject({
            id: 'PROGRAM_UNAVAILABLE',
            severity: 'error',
            details: {
                httpStatusCode: 409,
                errorCode: 'E7129',
                message: 'Program is specified but does not exist',
                request: 'analytics/trackedEntities/query',
            },
        })
    })

    it('falls back to a generic error for anything else', () => {
        expect(createLayerAlertFromError(new Error('Boom'))).toEqual({
            id: 'LOAD_FAILED',
            severity: 'error',
            title: 'Failed to load layer',
            details: { message: 'Boom' },
        })
        expect(createLayerAlertFromError('Boom').details.message).toBe('Boom')
    })
})

describe('alert helpers', () => {
    const warning = createLayerAlert(LAYER_ALERT_NO_DATA)
    const error = createLayerAlert(LAYER_ALERT_LOAD_FAILED)

    it('finds the most severe alert of the layers', () => {
        expect(
            getMostSevereAlert([
                { alerts: [warning] },
                {},
                { alerts: [{ code: 'ERROR_CRITICAL' }, error] },
            ])
        ).toBe(error)
        expect(getMostSevereAlert([{ alerts: [] }])).toBeUndefined()
    })

    it('tells new alerts from older { code, message } ones', () => {
        expect(isLayerAlert(warning)).toBe(true)
        expect(isLayerAlert({ code: 'WARNING_NO_DATA' })).toBe(false)
    })

    it('finds errors in new alerts and in loadError', () => {
        expect(hasLayerError({ alerts: [warning, error] })).toBe(true)
        expect(hasLayerError({ alerts: [warning] })).toBe(false)
        expect(hasLayerError({ loadError: 'Boom' })).toBe(true)
        expect(hasLayerError({})).toBe(false)
    })

    it('sorts errors first', () => {
        expect(
            sortBySeverity([warning, error]).map((alert) => alert.id)
        ).toEqual(['LOAD_FAILED', 'NO_DATA'])
    })

    it('formats details as plain text', () => {
        const text = formatAlertDetails(
            createLayerAlertFromError(
                Object.assign(
                    fetchError({ httpStatusCode: 409, errorCode: 'E7144' }),
                    { request: 'analytics/trackedEntities/query' }
                )
            ),
            {
                layerName: 'Malaria',
                layerType: 'trackedEntity',
                serverVersion: { major: 2, minor: 43, patch: 1 },
                appVersion: { full: '101.17.5', major: 101, minor: 17 },
                date: new Date('2026-10-06T10:00:00Z'),
            }
        )

        expect(text).toBe(
            [
                'Problem: Failed to load layer',
                'Layer: Malaria (trackedEntity)',
                'App version: 101.17.5',
                'Server version: 2.43.1',
                'Time: 2026-10-06T10:00:00.000Z',
                'Alert: LOAD_FAILED',
                'HTTP status: 409',
                'Error code: E7144',
                'Server message: Server error',
                'Request: analytics/trackedEntities/query',
            ].join('\n')
        )
    })
})

describe('throwWithRequest', () => {
    it('adds the failed request to the error and rethrows it', async () => {
        const error = new Error('Boom')

        await expect(
            Promise.reject(error).catch(throwWithRequest('analytics/query'))
        ).rejects.toBe(error)
        expect(error.request).toBe('analytics/query')
    })

    it('keeps the request of a deeper call', async () => {
        const error = Object.assign(new Error('Boom'), { request: 'first' })

        await expect(
            Promise.reject(error).catch(throwWithRequest('second'))
        ).rejects.toMatchObject({ request: 'first' })
    })
})

describe('getLayerAlerts', () => {
    it('returns the layer alerts', () => {
        const alerts = [createLayerAlert(LAYER_ALERT_NO_DATA)]
        expect(getLayerAlerts({ alerts })).toBe(alerts)
        expect(getLayerAlerts({})).toEqual([])
    })

    it('turns an older loadError into an error alert with its message', () => {
        expect(
            getLayerAlerts({ loadError: 'Data item was not found' })
        ).toEqual([
            {
                id: 'LOAD_FAILED',
                severity: 'error',
                title: 'Failed to load layer',
                description: 'Data item was not found',
            },
        ])
    })
})
