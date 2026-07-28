import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    FEATURE_HIGHLIGHT,
    LAYER_UPDATE,
} from '../../../constants/actionTypes.js'
import { EVENT_LAYER, THEMATIC_LAYER } from '../../../constants/layers.js'
import CombinedTableContextMenu from '../CombinedTableContextMenu.jsx'

const mockStore = configureMockStore()

const point = (id, coordinates, properties = {}) => ({
    type: 'Feature',
    properties: { id, ...properties },
    geometry: { type: 'Point', coordinates },
})

const layers = [
    {
        id: 'layerA',
        layer: THEMATIC_LAYER,
        data: [
            point('ou1', [0, 0], {
                level: '3',
                hasCoordinatesUp: true,
                hasCoordinatesDown: false,
                grandParentId: 'gp1',
                grandParentParentGraph: '/country1',
                parentGraph: '/country1/region1',
            }),
        ],
    },
    {
        id: 'layerB',
        layer: EVENT_LAYER, // not drillable
        data: [point('evt1', [5, 5])],
    },
]

const rowFeatureIds = new Map([['ou1', { layerA: ['ou1'], layerB: ['evt1'] }]])

const orgUnitJoinConfig = { level: 'orgUnit' }
const contextMenu = { x: 10, y: 10, rowId: 'ou1' }

const getLink = (testId) => screen.getByTestId(testId).querySelector('a')

const renderMenu = (props) => {
    const store = mockStore({})
    const result = render(
        <Provider store={store}>
            <CombinedTableContextMenu
                contextMenu={contextMenu}
                layers={layers}
                joinConfig={orgUnitJoinConfig}
                rowFeatureIds={rowFeatureIds}
                onClose={jest.fn()}
                {...props}
            />
        </Provider>
    )
    return { ...result, store }
}

describe('CombinedTableContextMenu — drill up/down', () => {
    test('is offered in orgUnit join mode, enabled per the drillable layer(s) capability', () => {
        renderMenu()
        expect(
            getLink('combined-table-context-menu-drill-up')
        ).not.toHaveAttribute('aria-disabled', 'true')
        expect(
            getLink('combined-table-context-menu-drill-down')
        ).toHaveAttribute('aria-disabled', 'true')
    })

    test('is not offered in parentOrgUnit join mode (no single org unit to drill from)', () => {
        renderMenu({ joinConfig: { level: 'parentOrgUnit' } })
        expect(
            screen.queryByTestId('combined-table-context-menu-drill-up')
        ).not.toBeInTheDocument()
    })

    test('drilling up dispatches updateLayer for the drillable layer only, using its own feature props', () => {
        const onClose = jest.fn()
        const { store } = renderMenu({ onClose })
        fireEvent.click(getLink('combined-table-context-menu-drill-up'))

        const layerUpdates = store
            .getActions()
            .filter((a) => a.type === LAYER_UPDATE)
        expect(layerUpdates).toHaveLength(1)
        expect(layerUpdates[0].payload.id).toBe('layerA')
        expect(layerUpdates[0].payload.rows[0].items).toEqual([
            { id: 'gp1', path: '/country1/gp1' },
            { id: 'LEVEL-2' },
        ])
        expect(onClose).toHaveBeenCalled()
    })
})

describe('CombinedTableContextMenu — zoom actions', () => {
    test('zoom to feature dispatches a crossLayerIds highlight with the union bounds', () => {
        const onClose = jest.fn()
        const { store } = renderMenu({ onClose })
        fireEvent.click(getLink('combined-table-context-menu-zoom-to-feature'))
        expect(store.getActions()).toContainEqual({
            type: FEATURE_HIGHLIGHT,
            payload: {
                layerId: null,
                origin: 'table',
                zoom: true,
                bounds: [
                    [0, 0],
                    [5, 5],
                ],
                crossLayerIds: { layerA: ['ou1'], layerB: ['evt1'] },
            },
        })
        expect(onClose).toHaveBeenCalled()
    })

    test('zoom to selected features is disabled when nothing is selected', () => {
        renderMenu({ selectedIds: [] })
        expect(
            getLink('combined-table-context-menu-zoom-to-selected')
        ).toHaveAttribute('aria-disabled', 'true')
    })

    test('zoom to selected features merges every selected row before zooming', () => {
        const { store } = renderMenu({ selectedIds: ['ou1'] })
        fireEvent.click(getLink('combined-table-context-menu-zoom-to-selected'))
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: FEATURE_HIGHLIGHT,
                payload: expect.objectContaining({
                    crossLayerIds: { layerA: ['ou1'], layerB: ['evt1'] },
                }),
            })
        )
    })

    test('zoom to filtered features is disabled when filteredIds is null (no active filter)', () => {
        renderMenu({ filteredIds: null })
        expect(
            getLink('combined-table-context-menu-zoom-to-filtered')
        ).toHaveAttribute('aria-disabled', 'true')
    })
})
