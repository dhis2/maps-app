import { LAYER_ALERT_NO_DATA } from '../../constants/layerAlerts.js'
import { getHashUrlParam } from '../history.js'
import { createLayerAlert } from '../layerAlerts.js'
import { getPreviewAlerts, withPreviewAlerts } from '../layerAlertsPreview.js'

jest.mock('../history.js', () => ({ getHashUrlParam: jest.fn() }))

describe('getPreviewAlerts', () => {
    it('shows every alert, with sample details on errors', () => {
        const alerts = getPreviewAlerts()
        const findAlert = (id) => alerts.find((alert) => alert.id === id)

        expect(findAlert('NO_DATA')).toBeDefined()
        expect(findAlert('LOAD_FAILED')).toBeDefined()
        alerts.forEach((alert) =>
            expect(Boolean(alert.details)).toBe(alert.severity === 'error')
        )
        expect(findAlert('TRACKED_ENTITIES_TRUNCATED').title).toBe(
            'Showing the first 50,000 tracked entities'
        )
        expect(findAlert('NO_ACCESS').details.httpStatusCode).toBe(403)
    })
})

describe('withPreviewAlerts', () => {
    const layer = {
        id: 'layer1',
        alerts: [createLayerAlert(LAYER_ALERT_NO_DATA)],
    }

    it('returns the layer unchanged without the URL param', () => {
        getHashUrlParam.mockReturnValue(undefined)

        expect(withPreviewAlerts(layer)).toBe(layer)
    })

    it('adds the preview alerts the layer does not have', () => {
        getHashUrlParam.mockReturnValue('')

        const ids = withPreviewAlerts(layer).alerts.map((alert) => alert.id)

        expect(ids).toHaveLength(getPreviewAlerts().length)
        expect(ids.filter((id) => id === 'NO_DATA')).toHaveLength(1)
    })
})
