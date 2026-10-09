import { screen, fireEvent } from '@testing-library/react'
import React from 'react'
import * as types from '../../../../constants/actionTypes.js'
import { mockCachedData, renderWithRedux } from '../../../../test-utils.jsx'
import BasemapCard from '../BasemapCard.jsx'

jest.mock('../../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => mockCachedDataReturn,
}))

let mockCachedDataReturn

describe('BasemapCard', () => {
    beforeEach(() => {
        mockCachedDataReturn = mockCachedData({
            basemaps: [
                {
                    id: 'sat1',
                    name: 'Satellite',
                    config: { type: 'raster' },
                },
            ],
        })
    })

    it('renders the resolved basemap name and subtitle', () => {
        const { container } = renderWithRedux(<BasemapCard />, {
            initialState: { map: { basemap: { id: 'sat1' } } },
        })

        expect(screen.getByTestId('basemapcard')).toBeInTheDocument()
        expect(container.querySelector('h2')).toHaveTextContent('Satellite')
        expect(container.querySelector('h3')).toHaveTextContent('Basemap')
    })

    it('dispatches selectBasemap when a basemap in the list is clicked', () => {
        mockCachedDataReturn = mockCachedData({
            basemaps: [
                { id: 'sat1', name: 'Satellite', config: {} },
                { id: 'osm1', name: 'OSM', config: {} },
            ],
        })

        const { store } = renderWithRedux(<BasemapCard />, {
            initialState: { map: { basemap: { id: 'sat1' } } },
        })

        fireEvent.click(screen.getByText('OSM'))

        expect(store.getActions()).toEqual([
            expect.objectContaining({
                type: types.BASEMAP_SELECTED,
                payload: { id: 'osm1', config: {} },
            }),
        ])
    })

    it('dispatches toggleBasemapExpand when the expand/collapse button is clicked', () => {
        const { container, store } = renderWithRedux(<BasemapCard />, {
            initialState: { map: { basemap: { id: 'sat1' } } },
        })

        fireEvent.click(container.querySelector('.expand'))

        expect(store.getActions()).toEqual([
            expect.objectContaining({ type: types.BASEMAP_TOGGLE_EXPAND }),
        ])
    })
})
