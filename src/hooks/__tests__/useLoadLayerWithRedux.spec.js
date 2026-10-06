import { renderHook, waitFor } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { setLayerLoading, updateLayer } from '../../actions/layers.js'
import { useLoadLayer } from '../useLoadLayer.js'
import { useLoadLayerWithRedux } from '../useLoadLayerWithRedux.js'

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}))
jest.mock('../useLoadLayer.js', () => ({ useLoadLayer: jest.fn() }))
jest.mock('../../components/loaders/useLoaderAlerts.js', () => () => ({
    showAlerts: mockShowAlerts,
}))
jest.mock('../../util/layerAlertsPreview.js', () => ({
    withPreviewAlerts: (layer) => layer,
}))

const mockShowAlerts = jest.fn()
const dispatch = jest.fn()
const loadLayer = jest.fn((config) =>
    Promise.resolve({ ...config, isLoaded: true, alerts: [] })
)

const renderLoader = ({ mapViews, dataTable = null, canLoadLayer }) => {
    useSelector.mockImplementation((selector) =>
        selector({ map: { mapViews }, dataTable })
    )
    useLoadLayer.mockReturnValue({
        loadLayer,
        canLoadLayer: canLoadLayer ?? (() => true),
    })
    renderHook(() => useLoadLayerWithRedux())
}

describe('useLoadLayerWithRedux', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useDispatch.mockReturnValue(dispatch)
    })

    it('loads the unloaded layers and stores the result', async () => {
        const config = { id: 'layer1', layer: 'trackedEntity' }

        renderLoader({
            mapViews: [config, { id: 'layer2', isLoaded: true }],
        })

        expect(dispatch).toHaveBeenCalledWith(setLayerLoading('layer1'))
        expect(loadLayer).toHaveBeenCalledTimes(1)
        expect(loadLayer).toHaveBeenCalledWith(config, { loadExtended: false })
        await waitFor(() =>
            expect(dispatch).toHaveBeenCalledWith(
                updateLayer({ ...config, isLoaded: true, alerts: [] })
            )
        )
        expect(mockShowAlerts).toHaveBeenCalledWith([])
    })

    it('skips layers already loading or not ready', () => {
        renderLoader({
            mapViews: [
                { id: 'layer1', isLoading: true },
                { id: 'layer2', layer: 'thematic' },
            ],
            canLoadLayer: (config) => config.layer !== 'thematic',
        })

        expect(loadLayer).not.toHaveBeenCalled()
    })

    it('reloads an event layer with extended data for the data table', () => {
        const config = { id: 'layer1', layer: 'event', isLoaded: true }

        renderLoader({ mapViews: [config], dataTable: 'layer1' })

        expect(loadLayer).toHaveBeenCalledWith(config, { loadExtended: true })
    })
})
