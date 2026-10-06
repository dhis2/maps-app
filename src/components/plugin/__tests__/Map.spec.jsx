/* eslint-disable react/prop-types */
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import Map from '../Map.jsx'

const mockLoads = {}
const mockResolve = {}
const mockCanLoad = { thematic: true }

jest.mock('../../../hooks/useLoadLayer.js', () => ({
    useLoadLayer: () => ({
        loadLayer: (config) => {
            mockLoads[config.id] = (mockLoads[config.id] || 0) + 1
            return new Promise((resolve) => {
                mockResolve[config.id] = resolve
            })
        },
        canLoadLayer: (config) => mockCanLoad[config.layer] ?? true,
    }),
}))
jest.mock('../../map/MapView.jsx', () => {
    const MapView = () => <div>MapView</div>
    return MapView
})
jest.mock('../Legend.jsx', () => () => null)
jest.mock('../ContextMenu.jsx', () => () => null)

const mapViews = [
    { id: 'ee', layer: 'earthEngine' },
    { id: 'th', layer: 'thematic', filters: [], rows: [] },
]

const loaded = (view) => ({ ...view, isLoaded: true })
const resize = () => act(() => window.dispatchEvent(new Event('resize')))
const finish = async (view) => {
    await act(async () => mockResolve[view.id](loaded(view)))
}

describe('Plugin Map', () => {
    beforeEach(() => {
        Object.keys(mockLoads).forEach((id) => delete mockLoads[id])
        mockCanLoad.thematic = true
    })

    test('loads every layer, then shows the map', async () => {
        render(<Map mapViews={mapViews} basemap={{}} />)
        expect(mockLoads).toEqual({ ee: 1, th: 1 })

        await finish(mapViews[0])
        expect(screen.queryByText('MapView')).not.toBeInTheDocument()

        await finish(mapViews[1])
        expect(screen.getByText('MapView')).toBeInTheDocument()
    })

    test('waits for period types before loading a thematic layer', async () => {
        mockCanLoad.thematic = false
        const { rerender } = render(<Map mapViews={mapViews} basemap={{}} />)
        expect(mockLoads).toEqual({ ee: 1 })

        // Period types arrive: the next render loads it
        mockCanLoad.thematic = true
        rerender(<Map mapViews={mapViews} basemap={{}} />)
        expect(mockLoads).toEqual({ ee: 1, th: 1 })

        await finish(mapViews[0])
        await finish(mapViews[1])
        expect(screen.getByText('MapView')).toBeInTheDocument()
    })

    test('loads each layer once when re-rendered while loading', async () => {
        const views = [
            { id: 'ee', layer: 'earthEngine' },
            { id: 'fa', layer: 'facility', filters: [], rows: [] },
            { id: 'th', layer: 'thematic', filters: [], rows: [] },
        ]
        // Props from the dashboard arrive as fresh copies of the same views
        const copyViews = () => JSON.parse(JSON.stringify(views))

        const { rerender } = render(<Map mapViews={views} basemap={{}} />)
        resize()
        rerender(<Map mapViews={copyViews()} basemap={{}} />)

        await finish(views[0])
        resize()
        rerender(<Map mapViews={copyViews()} basemap={{}} />)

        await finish(views[1])
        resize()

        expect(mockLoads).toEqual({ ee: 1, fa: 1, th: 1 })

        await finish(views[2])
        expect(screen.getByText('MapView')).toBeInTheDocument()
    })

    test('loads again when the views change', async () => {
        const { rerender } = render(<Map mapViews={mapViews} basemap={{}} />)
        await finish(mapViews[0])
        await finish(mapViews[1])

        // e.g. a dashboard filter adds a period filter
        rerender(
            <Map
                mapViews={[
                    mapViews[0],
                    { ...mapViews[1], filters: [{ dimension: 'pe' }] },
                ]}
                basemap={{}}
            />
        )

        expect(mockLoads).toEqual({ ee: 2, th: 2 })
    })

    test('ignores a load that finishes after the views changed', async () => {
        const changedViews = [
            mapViews[0],
            { ...mapViews[1], filters: [{ dimension: 'pe' }] },
        ]
        const { rerender } = render(<Map mapViews={mapViews} basemap={{}} />)
        const resolveFirstThematic = mockResolve.th

        rerender(<Map mapViews={changedViews} basemap={{}} />)
        await finish(mapViews[0])
        // The first thematic load finishes last, with the old filters
        await act(async () => resolveFirstThematic(loaded(mapViews[1])))

        expect(screen.queryByText('MapView')).not.toBeInTheDocument()

        await finish(changedViews[1])
        expect(screen.getByText('MapView')).toBeInTheDocument()
    })
})
