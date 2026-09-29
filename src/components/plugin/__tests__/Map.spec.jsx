/* eslint-disable react/prop-types */
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import Map from '../Map.jsx'

const mockMounted = new Set()
const mockOnLoad = {}
const mockLoads = {}

jest.mock('../LayerLoader.jsx', () => {
    const { useEffect } = require('react')
    const LayerLoader = ({ config, onLoad }) => {
        // LayerLoader loads each config object it receives once
        useEffect(() => {
            mockLoads[config.id] = (mockLoads[config.id] || 0) + 1
        }, [config])
        useEffect(() => {
            mockMounted.add(config.id)
            mockOnLoad[config.id] = onLoad
            return () => mockMounted.delete(config.id)
        }, [config, onLoad])
        return null
    }
    return LayerLoader
})
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

describe('Plugin Map', () => {
    beforeEach(() => {
        mockMounted.clear()
        Object.keys(mockLoads).forEach((id) => delete mockLoads[id])
    })

    test('keeps loaders mounted for pending layers (e.g. waiting for period types) when re-rendered', () => {
        render(<Map mapViews={mapViews} basemap={{}} />)
        expect([...mockMounted].sort()).toEqual(['ee', 'th'])

        act(() => mockOnLoad.ee({ id: 'ee', isLoaded: true }))
        act(() => window.dispatchEvent(new Event('resize')))

        expect(mockMounted.has('th')).toBe(true)

        act(() => mockOnLoad.th({ id: 'th', isLoaded: true }))
        expect(screen.getByText('MapView')).toBeInTheDocument()
    })

    test('loads each layer once when re-rendered while loading', () => {
        const views = [
            { id: 'ee', layer: 'earthEngine' },
            { id: 'fa', layer: 'facility', filters: [], rows: [] },
            { id: 'th', layer: 'thematic', filters: [], rows: [] },
        ]
        // Props from the dashboard arrive as fresh copies of the same views
        const copyViews = () => JSON.parse(JSON.stringify(views))
        const loaded = (view) => ({ ...view, isLoaded: true })
        const resize = () =>
            act(() => window.dispatchEvent(new Event('resize')))

        const { rerender } = render(<Map mapViews={views} basemap={{}} />)
        resize()
        rerender(<Map mapViews={copyViews()} basemap={{}} />)

        act(() => mockOnLoad.ee(loaded(views[0])))
        resize()
        rerender(<Map mapViews={copyViews()} basemap={{}} />)

        act(() => mockOnLoad.fa(loaded(views[1])))
        resize()

        expect(mockLoads).toEqual({ ee: 1, fa: 1, th: 1 })

        act(() => mockOnLoad.th(loaded(views[2])))
        expect(screen.getByText('MapView')).toBeInTheDocument()
    })
})
