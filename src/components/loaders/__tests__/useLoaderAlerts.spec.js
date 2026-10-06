import { renderHook } from '@testing-library/react'
import {
    LAYER_ALERT_LOAD_FAILED,
    LAYER_ALERT_NO_DATA,
} from '../../../constants/layerAlerts.js'
import { createLayerAlert } from '../../../util/layerAlerts.js'
import useLoaderAlerts from '../useLoaderAlerts.js'

const mockShow = jest.fn()

jest.mock('@dhis2/app-service-alerts', () => ({
    useAlert: () => ({ show: mockShow }),
}))

describe('useLoaderAlerts', () => {
    beforeEach(() => {
        mockShow.mockClear()
    })

    it('shows older alerts as snackbars', () => {
        const { result } = renderHook(() => useLoaderAlerts())

        result.current.showAlerts([
            { code: 'WARNING_NO_DATA', message: 'Thematic layer' },
        ])

        expect(mockShow).toHaveBeenCalledWith({
            msg: 'Thematic layer: No data found',
        })
    })

    it('leaves layer alerts to the legend', () => {
        const { result } = renderHook(() => useLoaderAlerts())

        result.current.showAlerts([
            createLayerAlert(LAYER_ALERT_NO_DATA),
            createLayerAlert(LAYER_ALERT_LOAD_FAILED),
        ])

        expect(mockShow).not.toHaveBeenCalled()
    })
})
