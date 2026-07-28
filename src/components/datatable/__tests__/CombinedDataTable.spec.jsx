import { render, screen } from '@testing-library/react'
import React from 'react'
import { VirtuosoMockContext } from 'react-virtuoso'
import useOrgUnitAncestorNames from '../../../hooks/useOrgUnitAncestorNames.js'
import CombinedDataTable from '../CombinedDataTable.jsx'

jest.mock('../../../hooks/useOrgUnitAncestorNames.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

beforeEach(() => {
    useOrgUnitAncestorNames.mockReturnValue({
        idToName: new Map(),
        loading: false,
    })
})

const feature = (props) => ({ properties: props })

const renderCombinedDataTable = (props) =>
    render(
        <VirtuosoMockContext.Provider
            value={{ viewportHeight: 300, itemHeight: 28 }}
        >
            <CombinedDataTable
                availableWidth={800}
                layers={[]}
                joinConfig={{
                    level: 'orgUnit',
                    layerIds: [],
                    pointLayerId: null,
                    polygonLayerId: null,
                }}
                {...props}
            />
        </VirtuosoMockContext.Provider>
    )

describe('CombinedDataTable', () => {
    test('renders a column header per computed header and a cell per row', () => {
        useOrgUnitAncestorNames.mockReturnValue({
            idToName: new Map([['ou1', 'Ou One']]),
            loading: false,
        })

        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        orgUnitId: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        level: 2,
                        rawValue: 10,
                        legend: 'Low',
                    }),
                ],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Value (Layer A)')).toBeInTheDocument()
        expect(screen.getByText('Legend (Layer A)')).toBeInTheDocument()
        expect(screen.getByText('Ou One')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
    })

    test('renders an em-dash for blank cell values', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [feature({ orgUnitId: 'ou1' })],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    })

    test('shows the empty-results placeholder when there are no rows', () => {
        renderCombinedDataTable({ layers: [] })

        expect(screen.getByText('No matching rows')).toBeInTheDocument()
    })

    test('shows the spatial warning banner when a spatial join exceeds the large-feature threshold', () => {
        const pointLayer = {
            id: 'points',
            name: 'Points',
            data: Array.from({ length: 10001 }, (_, i) => ({
                type: 'Feature',
                properties: { id: `p${i}` },
                geometry: { type: 'Point', coordinates: [1, 1] },
            })),
        }
        const polygonLayer = {
            id: 'polygons',
            name: 'Polygons',
            data: [
                {
                    type: 'Feature',
                    properties: { id: 'poly1', rawValue: 1 },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [0, 0],
                                [2, 0],
                                [2, 2],
                                [0, 2],
                                [0, 0],
                            ],
                        ],
                    },
                },
            ],
        }

        renderCombinedDataTable({
            layers: [pointLayer, polygonLayer],
            joinConfig: {
                level: 'spatial',
                layerIds: [],
                pointLayerId: 'points',
                polygonLayerId: 'polygons',
            },
        })

        expect(
            screen.getByText(/Spatial join over large datasets may be slow/)
        ).toBeInTheDocument()
    })

    test('calls onCountChange with the row count', () => {
        const onCountChange = jest.fn()
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ orgUnitId: 'ou1' }),
                    feature({ orgUnitId: 'ou2' }),
                ],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
            onCountChange,
        })

        expect(onCountChange).toHaveBeenCalledWith(2, 2)
    })
})
