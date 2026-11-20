import { renderHook } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { SENTINEL_NO_VALUE } from '../../../constants/dataTable.js'
import useOrgUnitAncestorNames from '../../../hooks/useOrgUnitAncestorNames.js'
import { useTableData } from '../useTableData.js'

jest.mock('../../map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

jest.mock('../../../hooks/useOrgUnitAncestorNames.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockStore = configureMockStore()

beforeEach(() => {
    useOrgUnitAncestorNames.mockReturnValue({
        idToName: new Map(),
        loading: false,
    })
})

describe('useTableData headers', () => {
    test('gets headers and rows for facility layer', () => {
        const store = {
            aggregations: {},
        }
        const layer = {
            layer: 'facility',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'facility-1',
                        name: 'Facility 1',
                        type: 'Point',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers, rows, isLoading } = result.current
        expect(headers).toHaveLength(5)
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id', type: 'string' },
            { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
            { name: 'Org unit level', dataKey: 'level', type: 'number' },
            {
                name: 'Org unit hierarchy',
                dataKey: 'orgUnitPath',
                type: 'orgUnit',
            },
            { name: 'Geometry type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(5)
        expect(rows[0]).toMatchObject([
            { value: 'facility-1', dataKey: 'id' },
            { value: undefined, dataKey: 'orgUnitOwn' },
            { value: null, dataKey: 'level' },
            { value: undefined, dataKey: 'orgUnitPath' },
            { value: 'Point', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('adds an Icon column for a facility layer styled by group set symbol', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'facility',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'facility-1',
                        name: 'Facility 1',
                        type: 'Point',
                        iconUrl: 'https://server/images/orgunitgroup/1.png',
                        group: 'Hospitals',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers, rows } = result.current
        expect(headers).toContainEqual({
            name: 'Icon',
            dataKey: 'iconUrl',
            type: 'string',
            renderer: 'rendericon',
        })
        expect(headers).toContainEqual({
            name: 'Group',
            dataKey: 'group',
            type: 'string',
        })
        expect(headers).not.toContainEqual(
            expect.objectContaining({ dataKey: 'color' })
        )
        expect(rows[0]).toContainEqual(
            expect.objectContaining({
                value: 'https://server/images/orgunitgroup/1.png',
                dataKey: 'iconUrl',
            })
        )
    })

    test('adds a Color column for an orgUnit layer styled by group set color', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'orgUnit',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou-1',
                        name: 'Bo District',
                        type: 'MultiPolygon',
                        level: 2,
                        color: '#ff0000',
                        group: 'Rural',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers } = result.current
        expect(headers).toContainEqual(
            expect.objectContaining({ name: 'Color', dataKey: 'color' })
        )
        expect(headers).toContainEqual(
            expect.objectContaining({ name: 'Group', dataKey: 'group' })
        )
        expect(headers).not.toContainEqual(
            expect.objectContaining({ dataKey: 'iconUrl' })
        )
    })

    test('gets headers and rows for orgUnit layer', () => {
        const store = {
            aggregations: {},
        }
        const layer = {
            layer: 'orgUnit',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'orgunit-id-1',
                        name: 'OrgUnitName 1',
                        type: 'MultiPolygon',
                        level: 3,
                        parentName: 'Bo',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows, isLoading } = result.current
        expect(headers).toHaveLength(5)
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id', type: 'string' },
            { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
            { name: 'Org unit level', dataKey: 'level', type: 'number' },
            {
                name: 'Org unit hierarchy',
                dataKey: 'orgUnitPath',
                type: 'orgUnit',
            },
            { name: 'Geometry type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(5)
        expect(rows[0]).toMatchObject([
            { value: 'orgunit-id-1', dataKey: 'id' },
            { value: undefined, dataKey: 'orgUnitOwn' },
            { value: 3, dataKey: 'level' },
            { value: undefined, dataKey: 'orgUnitPath' },
            { value: 'MultiPolygon', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('gets headers and rows for thematic layer', () => {
        const store = {
            aggregations: {},
        }
        const layer = {
            layer: 'thematic',
            dataFilters: null,
            data: [
                {
                    properties: {
                        type: 'Point',
                        id: 'thematicId-1',
                        name: 'Ngelehun CHC',
                        level: 4,
                        parentName: 'Badjia',
                        color: '#FFFFB2',
                        legend: 'Great',
                        range: '90 – 120',
                        value: '106.3',
                        rawValue: 106.3,
                    },
                },
            ],
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows, isLoading } = result.current
        expect(headers).toHaveLength(9)
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id', type: 'string' },
            { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
            { name: 'Org unit level', dataKey: 'level', type: 'number' },
            {
                name: 'Org unit hierarchy',
                dataKey: 'orgUnitPath',
                type: 'orgUnit',
            },
            { name: 'Value', dataKey: 'rawValue', type: 'number' },
            { name: 'Legend', dataKey: 'legend', type: 'string' },
            { name: 'Range', dataKey: 'range', type: 'string' },
            {
                name: 'Color',
                dataKey: 'color',
                type: 'string',
                renderer: 'rendercolor',
            },
            { name: 'Geometry type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(9)
        expect(rows[0]).toMatchObject([
            { value: 'thematicId-1', dataKey: 'id' },
            { value: undefined, dataKey: 'orgUnitOwn' },
            { value: 4, dataKey: 'level' },
            { value: undefined, dataKey: 'orgUnitPath' },
            { value: 106.3, dataKey: 'rawValue' },
            { value: 'Great', dataKey: 'legend' },
            { value: '90 – 120', dataKey: 'range' },
            { value: '#FFFFB2', dataKey: 'color' },
            { value: 'Point', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('gets current-period Value/Legend/Range/Color for a timeline thematic layer', () => {
        // The active timeline period is Map.jsx's own local UI state, synced
        // into state.ui.activeTimelinePeriod (not part of the layer config).
        const store = {
            aggregations: {},
            ui: {
                activeTimelinePeriod: { id: '202302', name: 'February 2023' },
            },
        }
        const layer = {
            layer: 'thematic',
            renderingStrategy: 'TIMELINE',
            valuesByPeriod: {
                202301: {
                    'ou-1': { value: 100, color: '#aaaaaa', legend: 'Low' },
                },
                202302: {
                    'ou-1': {
                        value: 200,
                        color: '#bbbbbb',
                        legend: 'High',
                        range: '150 – 250',
                    },
                },
            },
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou-1',
                        name: 'Ngelehun CHC',
                        type: 'Point',
                    },
                },
            ],
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows } = result.current
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id' },
            { name: 'Org unit', dataKey: 'orgUnitOwn' },
            { name: 'Org unit level', dataKey: 'level' },
            { name: 'Org unit hierarchy', dataKey: 'orgUnitPath' },
            { name: 'Value (February 2023)', dataKey: 'rawValue' },
            { name: 'Legend (February 2023)', dataKey: 'legend' },
            { name: 'Range (February 2023)', dataKey: 'range' },
            { name: 'Color (February 2023)', dataKey: 'color' },
            { name: 'Geometry type', dataKey: 'type' },
        ])
        expect(rows[0]).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ value: 200, dataKey: 'rawValue' }),
                expect.objectContaining({ value: 'High', dataKey: 'legend' }),
                expect.objectContaining({
                    value: '150 – 250',
                    dataKey: 'range',
                }),
            ])
        )
    })

    test('adds a defaultHidden raw-value-only column for every other period, for a timeline thematic layer', () => {
        const store = {
            aggregations: {},
            ui: {
                activeTimelinePeriod: { id: '202302', name: 'February 2023' },
            },
        }
        const layer = {
            layer: 'thematic',
            renderingStrategy: 'TIMELINE',
            periods: [
                { id: '202301', name: 'January 2023' },
                { id: '202302', name: 'February 2023' },
            ],
            valuesByPeriod: {
                202301: { 'ou-1': { value: 100 } },
                202302: { 'ou-1': { value: 200 } },
            },
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou-1',
                        name: 'Ngelehun CHC',
                        type: 'Point',
                    },
                },
            ],
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows } = result.current
        expect(headers).not.toContainEqual(
            expect.objectContaining({ dataKey: 'period_202302_rawValue' })
        )
        expect(headers).toContainEqual({
            name: 'Value (January 2023)',
            dataKey: 'period_202301_rawValue',
            type: 'number',
            defaultHidden: true,
        })
        expect(rows[0]).toContainEqual(
            expect.objectContaining({
                value: 100,
                dataKey: 'period_202301_rawValue',
            })
        )
    })

    test('split-by-period thematic layer has no default current-period column, only defaultHidden period columns', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'thematic',
            renderingStrategy: 'SPLIT_BY_PERIOD',
            periods: [{ id: '202301', name: 'January 2023' }],
            valuesByPeriod: {
                202301: { 'ou-1': { value: 100 } },
            },
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou-1',
                        name: 'Ngelehun CHC',
                        type: 'Point',
                    },
                },
            ],
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows } = result.current
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id' },
            { name: 'Org unit', dataKey: 'orgUnitOwn' },
            { name: 'Org unit level', dataKey: 'level' },
            { name: 'Org unit hierarchy', dataKey: 'orgUnitPath' },
            { name: 'Geometry type', dataKey: 'type' },
            {
                name: 'Value (January 2023)',
                dataKey: 'period_202301_rawValue',
                defaultHidden: true,
            },
        ])
        expect(rows[0]).not.toContainEqual(
            expect.objectContaining({ dataKey: 'rawValue' })
        )
        expect(rows[0]).toContainEqual(
            expect.objectContaining({
                value: 100,
                dataKey: 'period_202301_rawValue',
            })
        )
    })

    test('gets headers and rows for event layer', () => {
        const store = {
            aggregations: {},
        }
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            headers: [
                {
                    name: 'ps',
                    column: 'Program stage',
                    valueType: 'TEXT',
                },
                {
                    name: 'eventdate',
                    column: 'Report date',
                    valueType: 'DATE',
                },
                {
                    name: 'lastupdated',
                    column: 'Last updated on',
                    valueType: 'DATE',
                },
                {
                    name: 'eventstatus',
                    column: 'Event status',
                    valueType: 'TEXT',
                },
                {
                    name: 'oZg33kd9taw',
                    column: 'Gender',
                    valueType: 'TEXT',
                },
            ],

            data: [
                {
                    properties: {
                        id: 'a9712323629',
                        type: 'Point',
                        ps: 'pTo4uMt3xur',
                        eventdate: '2023-05-15 00:00:00.0',
                        lastupdated: '2018-04-12 20:58:51.31',
                        ouname: 'Lumley Hospital',
                        eventstatus: 'ACTIVE',
                        oZg33kd9taw: 'Female',
                        value: 'Female',
                        color: '#ff7f00',
                    },
                },
            ],
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows, isLoading } = result.current
        expect(headers).toHaveLength(10)
        expect(headers).toMatchObject([
            { name: 'Event Id', dataKey: 'id', type: 'string' },
            { name: 'Org unit Id', dataKey: 'orgUnitId', type: 'string' },
            { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
            { name: 'Org unit level', dataKey: 'level', type: 'number' },
            {
                name: 'Org unit hierarchy',
                dataKey: 'orgUnitPath',
                type: 'orgUnit',
                renderer: 'renderorgunit',
            },
            {
                name: 'Event date',
                dataKey: 'eventdate',
                type: 'date',
                renderer: 'renderdate',
            },
            {
                name: 'Last updated',
                dataKey: 'lastupdated',
                type: 'datetime',
                renderer: 'renderdate',
            },
            { name: 'Event status', dataKey: 'eventstatus', type: 'string' },
            { name: 'Gender', dataKey: 'oZg33kd9taw', type: 'string' },
            { name: 'Geometry type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(10)
        expect(rows[0]).toMatchObject([
            { value: 'a9712323629', dataKey: 'id' },
            { value: undefined, dataKey: 'orgUnitId' },
            { value: undefined, dataKey: 'orgUnitOwn' },
            { value: null, dataKey: 'level' },
            { value: undefined, dataKey: 'orgUnitPath' },
            { value: '2023-05-15 00:00:00.0', dataKey: 'eventdate' },
            { value: '2018-04-12 20:58:51.31', dataKey: 'lastupdated' },
            { value: 'ACTIVE', dataKey: 'eventstatus' },
            { value: 'Female', dataKey: 'oZg33kd9taw' },
            { value: 'Point', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('is not "extending" a server-clustered event layer that has not been forced to client-cluster', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            serverCluster: true,
            isExtended: false,
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.loadingReason).toBeNull()
    })

    test('shows "Loading additional events…" while forceClientCluster reload is in flight', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            serverCluster: true,
            forceClientCluster: true,
            isExtended: false,
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingReason).toBe('Loading additional events…')
    })

    test('treats NUMBER header with optionSet as string type', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            headers: [
                {
                    name: 'AbCdEfGhIjK',
                    column: 'Severity',
                    valueType: 'NUMBER',
                    optionSet: { id: 'xyz123' },
                },
            ],
            data: [
                {
                    properties: {
                        id: 'evt1',
                        type: 'Point',
                        ouname: 'Test OU',
                        eventdate: '2023-01-01',
                        AbCdEfGhIjK: 'high',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers } = result.current
        const severityHeader = headers.find((h) => h.dataKey === 'AbCdEfGhIjK')
        expect(severityHeader.type).toBe('string')
    })

    test('treats NUMBER header without optionSet as number type', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            headers: [
                {
                    name: 'AbCdEfGhIjK',
                    column: 'Score',
                    valueType: 'NUMBER',
                },
            ],
            data: [
                {
                    properties: {
                        id: 'evt2',
                        type: 'Point',
                        ouname: 'Test OU',
                        eventdate: '2023-01-01',
                        AbCdEfGhIjK: 42,
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers } = result.current
        const scoreHeader = headers.find((h) => h.dataKey === 'AbCdEfGhIjK')
        expect(scoreHeader.type).toBe('number')
    })

    test('adds Legend/Range/Color columns for an event layer styled by a numeric data item', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            styleDataItem: { id: 'AbCdEfGhIjK' },
            legend: {
                items: [
                    {
                        name: 'Low',
                        color: '#aaaaaa',
                        startValue: 0,
                        endValue: 50,
                        colorGroup: 0,
                    },
                    {
                        name: 'High',
                        color: '#bbbbbb',
                        startValue: 50,
                        endValue: 100,
                        colorGroup: 1,
                    },
                ],
            },
            headers: [
                { name: 'AbCdEfGhIjK', column: 'Score', valueType: 'NUMBER' },
            ],
            data: [
                {
                    properties: {
                        id: 'evt1',
                        type: 'Point',
                        ouname: 'Test OU',
                        eventdate: '2023-01-01',
                        AbCdEfGhIjK: 75,
                        value: 75,
                        color: '#bbbbbb',
                        colorGroup: 1,
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers, rows } = result.current
        expect(headers).toContainEqual({
            name: 'Legend',
            dataKey: 'legend',
            type: 'string',
        })
        expect(headers).toContainEqual({
            name: 'Range',
            dataKey: 'range',
            type: 'string',
        })
        expect(rows[0]).toContainEqual(
            expect.objectContaining({ value: 'High', dataKey: 'legend' })
        )
        expect(rows[0]).toContainEqual(
            expect.objectContaining({ value: '50 – 100', dataKey: 'range' })
        )
    })

    test('formats an event layer’s Range using the layer’s own legendDecimalPlaces', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            styleDataItem: { id: 'AbCdEfGhIjK' },
            legendDecimalPlaces: 1,
            legend: {
                items: [
                    {
                        name: 'High',
                        color: '#bbbbbb',
                        startValue: 50.256,
                        endValue: 100.789,
                        colorGroup: 0,
                    },
                ],
            },
            headers: [
                { name: 'AbCdEfGhIjK', column: 'Score', valueType: 'NUMBER' },
            ],
            data: [
                {
                    properties: {
                        id: 'evt1',
                        type: 'Point',
                        ouname: 'Test OU',
                        eventdate: '2023-01-01',
                        AbCdEfGhIjK: 75,
                        value: 75,
                        color: '#bbbbbb',
                        colorGroup: 0,
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        expect(result.current.rows[0]).toContainEqual(
            expect.objectContaining({ value: '50.3 – 100.8', dataKey: 'range' })
        )
    })

    test('leaves Range empty for an event layer styled by a non-numeric (option set) data item', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            styleDataItem: { id: 'AbCdEfGhIjK', optionSet: { id: 'os1' } },
            legend: {
                items: [{ name: 'Yes', color: '#00ff00', colorGroup: 0 }],
            },
            headers: [
                { name: 'AbCdEfGhIjK', column: 'Answer', valueType: 'TEXT' },
            ],
            data: [
                {
                    properties: {
                        id: 'evt1',
                        type: 'Point',
                        ouname: 'Test OU',
                        eventdate: '2023-01-01',
                        AbCdEfGhIjK: 'Yes',
                        value: 'Yes',
                        color: '#00ff00',
                        colorGroup: 0,
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { rows } = result.current
        expect(rows[0]).toContainEqual(
            expect.objectContaining({ value: 'Yes', dataKey: 'legend' })
        )
        expect(rows[0]).toContainEqual(
            expect.objectContaining({ value: undefined, dataKey: 'range' })
        )
    })

    test('gets headers and rows for EE population layer', () => {
        const store = {
            aggregations: {
                eelayerid: {
                    boOU: {
                        mean: 47.34593724212383,
                        sum: 851090.567864418,
                    },
                    bombaliOU: {
                        mean: 27.347820392739166,
                        sum: 585872.3562736511,
                    },
                },
            },
        }

        const layer = {
            layer: 'earthEngine',
            aggregationType: ['sum', 'mean'],
            legend: {
                title: 'Population',
            },
            id: 'eelayerid',
            dataFilters: null,
            data: [
                {
                    id: 'boOU',
                    properties: {
                        type: 'Polygon',
                        id: 'boOu',
                        name: 'Bo',
                    },
                },
                {
                    id: 'bombaliOU',
                    properties: {
                        type: 'Polygon',
                        id: 'bombaliOU',
                        name: 'Bombali',
                    },
                },
            ],
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows, isLoading } = result.current

        expect(headers).toHaveLength(7)
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id', type: 'string' },
            { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
            { name: 'Org unit level', dataKey: 'level', type: 'number' },
            {
                name: 'Org unit hierarchy',
                dataKey: 'orgUnitPath',
                type: 'orgUnit',
            },
            {
                name: 'Sum Population',
                dataKey: 'sum',
                // roundFn: Function.prototype,
                type: 'number',
            },
            {
                name: 'Mean Population',
                dataKey: 'mean',
                // roundFn: Function.prototype,
                type: 'number',
            },
            { name: 'Geometry type', dataKey: 'type', type: 'string' },
        ])
        expect(headers[4].roundFn).toBeInstanceOf(Function)
        expect(headers[5].roundFn).toBeInstanceOf(Function)
        expect(rows).toHaveLength(2)
        expect(rows[0]).toHaveLength(7)
        expect(rows[0]).toMatchObject([
            { value: 'boOu', dataKey: 'id' },
            { value: undefined, dataKey: 'orgUnitOwn' },
            { value: null, dataKey: 'level' },
            { value: undefined, dataKey: 'orgUnitPath' },
            { value: 851091, dataKey: 'sum' },
            { value: 47.35, dataKey: 'mean' },
            { value: 'Polygon', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('gets headers and rows for EE population age groups layer', () => {
        const store = {
            aggregations: {
                eelayerid: {
                    badijaOU: {
                        M_0_mean: 0.4416957503717281,
                        M_0_sum: 279.5934099853039,
                        M_1_mean: 1.667343524395007,
                        M_1_sum: 1055.4284509420395,
                        M_5_mean: 1.8668244672235907,
                        M_5_sum: 1181.699887752533,
                        mean: 3.975863741990326,
                        sum: 2516.7217486798763,
                    },
                    baomaOU: {
                        M_0_mean: 0.6669754306043404,
                        M_0_sum: 1012.4687036573887,
                        M_1_mean: 2.517744771694477,
                        M_1_sum: 3821.9365634322166,
                        M_5_mean: 2.818359887764859,
                        M_5_sum: 4278.270309627056,
                        mean: 6.003080090063677,
                        sum: 9112.675576716661,
                    },
                },
            },
        }

        const layer = {
            layer: 'earthEngine',
            name: 'Population age groups',
            aggregationType: ['sum', 'mean'],
            id: 'eelayerid',
            legend: {
                title: 'Population age groups',
                groups: [
                    {
                        id: 'M_0',
                        name: 'Male 0 - 1 years',
                    },
                    {
                        id: 'M_1',
                        name: 'Male 1 - 4 years',
                    },
                    {
                        id: 'M_5',
                        name: 'Male 5 - 9 years',
                    },
                ],
                items: [
                    {
                        color: '#fee5d9',
                        from: 0,
                        to: 10,
                        name: '0 - 10',
                    },
                    {
                        color: '#fcbba1',
                        from: 10,
                        to: 20,
                        name: '10 - 20',
                    },
                    {
                        color: '#fc9272',
                        from: 20,
                        to: 30,
                        name: '20 - 30',
                    },
                    {
                        color: '#fb6a4a',
                        from: 30,
                        to: 40,
                        name: '30 - 40',
                    },
                    {
                        color: '#de2d26',
                        from: 40,
                        to: 50,
                        name: '40 - 50',
                    },
                    {
                        color: '#a50f15',
                        from: 50,
                        name: '> 50',
                    },
                ],
            },
            data: [
                {
                    id: 'badijaOU',
                    properties: {
                        type: 'Polygon',
                        id: 'boOU',
                        name: 'Badija',
                    },
                },
                {
                    type: 'Feature',
                    id: 'baomaOU',
                    properties: {
                        type: 'Polygon',
                        id: 'baomaOU',
                        name: 'Baoma',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )
        const { headers, rows, isLoading } = result.current

        expect(headers).toHaveLength(7)
        expect(headers).toMatchObject([
            { name: 'Org unit Id', dataKey: 'id', type: 'string' },
            { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
            { name: 'Org unit level', dataKey: 'level', type: 'number' },
            {
                name: 'Org unit hierarchy',
                dataKey: 'orgUnitPath',
                type: 'orgUnit',
            },
            {
                name: 'Sum Population Age Groups',
                dataKey: 'sum',
                // roundFn: Function.prototype,
                type: 'number',
            },
            {
                name: 'Mean Population Age Groups',
                dataKey: 'mean',
                // roundFn: Function.prototype,
                type: 'number',
            },
            { name: 'Geometry type', dataKey: 'type', type: 'string' },
        ])
        expect(headers[4].roundFn).toBeInstanceOf(Function)
        expect(headers[5].roundFn).toBeInstanceOf(Function)
        expect(rows).toHaveLength(2)
        expect(rows[0]).toHaveLength(7)
        expect(rows[0]).toMatchObject([
            { value: 'boOU', dataKey: 'id' },
            { value: undefined, dataKey: 'orgUnitOwn' },
            { value: null, dataKey: 'level' },
            { value: undefined, dataKey: 'orgUnitPath' },
            { value: 2517, dataKey: 'sum' },
            { value: 3.976, dataKey: 'mean' },
            { value: 'Polygon', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('gets headers and rows for a geoJsonUrl layer, labeling the synthetic color property "Color"', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'geoJsonUrl',
            dataFilters: null,
            data: [
                {
                    geometry: { type: 'Point' },
                    properties: {
                        id: 'feature-1',
                        name: 'Feature 1',
                        color: '#ff0000',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const { headers, rows } = result.current
        expect(headers).toContainEqual({
            name: 'Color',
            dataKey: 'color',
            type: 'string',
            renderer: 'rendercolor',
        })
        expect(rows[0]).toContainEqual(
            expect.objectContaining({ value: '#ff0000', dataKey: 'color' })
        )
    })
})

describe('useTableData sorting', () => {
    const mockLayer = {
        id: 'test-layer',
        layer: 'thematic',
        dataFilters: null,
        data: [
            { id: '1', properties: { name: 'Item A', rawValue: 10 } },
            { id: '2', properties: { name: 'Item B', rawValue: 5 } },
            { id: '3', properties: { name: 'Item C', rawValue: undefined } },
            { id: '4', properties: { name: 'Item D', rawValue: 15 } },
            { id: '5', properties: { name: 'Item E', rawValue: undefined } },
        ],
    }

    test('sorts numeric values in ascending order with undefined/null at end', () => {
        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: mockLayer,
                    sortField: 'rawValue',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const valueColumn = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'rawValue')?.value
        )
        expect(valueColumn).toEqual([5, 10, 15, null, null])
    })

    test('sorts numeric values in descending order with undefined/null at end', () => {
        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: mockLayer,
                    sortField: 'rawValue',
                    sortDirection: 'desc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const valueColumn = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'rawValue')?.value
        )
        expect(valueColumn).toEqual([15, 10, 5, null, null])
    })

    test('sorts string values in ascending order with undefined at end', () => {
        const layerWithStringData = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { id: '1', properties: { orgUnitOwn: 'Zebra', value: 10 } },
                { id: '2', properties: { orgUnitOwn: 'Apple', value: 5 } },
                { id: '3', properties: { orgUnitOwn: undefined, value: 20 } },
                { id: '4', properties: { orgUnitOwn: 'Banana', value: 15 } },
            ],
        }

        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerWithStringData,
                    sortField: 'orgUnitOwn',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const nameColumn = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'orgUnitOwn')?.value
        )
        expect(nameColumn).toEqual(['Apple', 'Banana', 'Zebra', undefined])
    })

    test('sorts string values in descending order with undefined at end', () => {
        const layerWithStringData = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { id: '1', properties: { orgUnitOwn: 'Zebra', value: 10 } },
                { id: '2', properties: { orgUnitOwn: 'Apple', value: 5 } },
                { id: '3', properties: { orgUnitOwn: undefined, value: 20 } },
                { id: '4', properties: { orgUnitOwn: 'Banana', value: 15 } },
            ],
        }

        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerWithStringData,
                    sortField: 'orgUnitOwn',
                    sortDirection: 'desc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const nameColumn = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'orgUnitOwn')?.value
        )
        expect(nameColumn).toEqual(['Zebra', 'Banana', 'Apple', undefined])
    })

    test('handles multiple undefined values correctly', () => {
        const layerWithManyUndefined = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { id: '1', properties: { name: 'Item A', rawValue: 10 } },
                {
                    id: '2',
                    properties: { name: 'Item B', rawValue: undefined },
                },
                {
                    id: '3',
                    properties: { name: 'Item C', rawValue: undefined },
                },
                { id: '4', properties: { name: 'Item D', rawValue: 5 } },
            ],
        }

        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerWithManyUndefined,
                    sortField: 'rawValue',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const valueColumn = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'rawValue')?.value
        )
        expect(valueColumn).toEqual([5, 10, null, null])
    })

    test('handles all undefined values', () => {
        const layerWithAllUndefined = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                {
                    id: '1',
                    properties: { name: 'Item A', rawValue: undefined },
                },
                {
                    id: '2',
                    properties: { name: 'Item B', rawValue: undefined },
                },
                {
                    id: '3',
                    properties: { name: 'Item C', rawValue: undefined },
                },
            ],
        }

        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerWithAllUndefined,
                    sortField: 'rawValue',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const valueColumn = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'rawValue')?.value
        )
        expect(valueColumn).toEqual([null, null, null])
    })

    test('falls back to natural (index) order when sortField is null', () => {
        const layerInInputOrder = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                {
                    properties: { id: '1', orgUnitOwn: 'Item C', rawValue: 3 },
                },
                {
                    properties: { id: '2', orgUnitOwn: 'Item A', rawValue: 1 },
                },
                {
                    properties: { id: '3', orgUnitOwn: 'Item B', rawValue: 2 },
                },
            ],
        }
        const store = { aggregations: {} }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerInInputOrder,
                    sortField: null,
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const names = result.current.rows.map(
            (row) => row.find((c) => c.dataKey === 'orgUnitOwn')?.value
        )
        expect(names).toEqual(['Item C', 'Item A', 'Item B'])
    })
})

describe('useTableData columnOptions', () => {
    const store = { aggregations: {} }

    const renderTableData = (layer) =>
        renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        ).result

    test('gives options to every column type once distinct values are within the cap', () => {
        const layer = {
            layer: 'thematic',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou1',
                        orgUnitOwn: 'Org unit 1',
                        rawValue: 10,
                        legend: 'High',
                        range: '5 - 15',
                        level: 1,
                        type: 'Point',
                        color: '#ff0000',
                    },
                },
                {
                    properties: {
                        id: 'ou2',
                        orgUnitOwn: 'Org unit 2',
                        rawValue: 20,
                        legend: 'Low',
                        range: '15 - 25',
                        level: 1,
                        type: 'Point',
                        color: '#00ff00',
                    },
                },
            ],
        }

        const { current } = renderTableData(layer)

        expect(current.columnOptions.legend).toEqual([
            { value: 'High' },
            { value: 'Low' },
        ])
        expect(current.columnOptions.type).toEqual([{ value: 'Point' }])
        expect(current.columnOptions.orgUnitOwn).toEqual([
            { value: 'Org unit 1' },
            { value: 'Org unit 2' },
        ])
        expect(current.columnOptions.id).toEqual([
            { value: 'ou1' },
            { value: 'ou2' },
        ])
        expect(current.columnOptions.rawValue).toEqual([
            { value: '10' },
            { value: '20' },
        ])
        expect(current.columnOptions.level).toEqual([{ value: '1' }])
    })

    test('gives options to a column even with many distinct values - no cap', () => {
        const layer = {
            layer: 'orgUnit',
            dataFilters: null,
            data: Array.from({ length: 31 }, (_, i) => ({
                properties: {
                    id: `ou${i}`,
                    name: `Org unit ${i}`,
                    level: 1,
                    parentName: 'Country',
                    type: `Type${i}`,
                },
            })),
        }

        const { current } = renderTableData(layer)

        expect(current.columnOptions.type).toHaveLength(31)
    })

    test('sorts numeric column options numerically, not lexically', () => {
        const layer = {
            layer: 'thematic',
            dataFilters: null,
            data: [10, 2, 33].map((rawValue, i) => ({
                properties: {
                    id: `ou${i}`,
                    name: `Org unit ${i}`,
                    rawValue,
                    legend: 'High',
                    range: '0 - 100',
                    level: 1,
                    parentName: 'Country',
                    type: 'Point',
                    color: '#ff0000',
                },
            })),
        }

        const { current } = renderTableData(layer)

        expect(current.columnOptions.rawValue).toEqual([
            { value: '2' },
            { value: '10' },
            { value: '33' },
        ])
    })

    test('sorts range column options by their parsed bounds, not lexically', () => {
        const layer = {
            layer: 'thematic',
            dataFilters: null,
            data: ['90 - 120', '9 - 12', '10 - 20'].map((range, i) => ({
                properties: {
                    id: `ou${i}`,
                    name: `Org unit ${i}`,
                    rawValue: 1,
                    legend: 'High',
                    range,
                    level: 1,
                    parentName: 'Country',
                    type: 'Point',
                    color: '#ff0000',
                },
            })),
        }

        const { current } = renderTableData(layer)

        expect(current.columnOptions.range).toEqual([
            { value: '9 - 12' },
            { value: '10 - 20' },
            { value: '90 - 120' },
        ])
    })

    test('includes a SENTINEL_NO_VALUE option when some rows have a blank value', () => {
        const layer = {
            layer: 'orgUnit',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou1',
                        orgUnitOwn: 'Country',
                        level: 1,
                        type: 'Point',
                    },
                },
                {
                    properties: {
                        id: 'ou2',
                        orgUnitOwn: '',
                        level: 1,
                        type: 'Point',
                    },
                },
                {
                    properties: {
                        id: 'ou3',
                        // orgUnitOwn omitted entirely (undefined)
                        level: 1,
                        type: 'Point',
                    },
                },
            ],
        }

        const { current } = renderTableData(layer)

        expect(current.columnOptions.orgUnitOwn).toEqual([
            { value: SENTINEL_NO_VALUE },
            { value: 'Country' },
        ])
    })

    test('exposes optionSet on event columns for later resolution by FilterInput', () => {
        const layer = {
            layer: 'event',
            dataFilters: null,
            isExtended: true,
            headers: [
                {
                    name: 'AbCdEfGhIjK',
                    column: 'Case classification',
                    valueType: 'TEXT',
                    optionSet: { id: 'xyz123' },
                },
            ],
            data: [
                {
                    properties: {
                        id: 'evt1',
                        type: 'Point',
                        ouname: 'Test OU',
                        eventdate: '2023-01-01',
                        AbCdEfGhIjK: 'CONFIRMED',
                    },
                },
            ],
        }

        const { current } = renderTableData(layer)

        const header = current.headers.find((h) => h.dataKey === 'AbCdEfGhIjK')
        expect(header.optionSet).toEqual({ id: 'xyz123' })
        expect(current.columnOptions.AbCdEfGhIjK).toEqual([
            { value: 'CONFIRMED' },
        ])
    })

    test('matches the currently sorted column direction, leaving other columns ascending', () => {
        const layer = {
            layer: 'thematic',
            dataFilters: null,
            data: [
                {
                    properties: {
                        id: 'ou1',
                        orgUnitOwn: 'Org unit 1',
                        rawValue: 10,
                        legend: 'High',
                        level: 1,
                        type: 'Point',
                    },
                },
                {
                    properties: {
                        id: 'ou2',
                        orgUnitOwn: 'Org unit 2',
                        rawValue: 20,
                        legend: 'Low',
                        level: 1,
                        type: 'Point',
                    },
                },
            ],
        }

        const { result } = renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'orgUnitOwn',
                    sortDirection: 'desc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        // Sorted column (orgUnitOwn, desc) is reversed to match...
        expect(result.current.columnOptions.orgUnitOwn).toEqual([
            { value: 'Org unit 2' },
            { value: 'Org unit 1' },
        ])
        // ...while every other column stays in its default ascending order.
        expect(result.current.columnOptions.rawValue).toEqual([
            { value: '10' },
            { value: '20' },
        ])
        expect(result.current.columnOptions.legend).toEqual([
            { value: 'High' },
            { value: 'Low' },
        ])
    })
})
