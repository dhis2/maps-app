import { renderHook } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    SENTINEL_SELECTED_ROW,
    SENTINEL_NO_VALUE,
} from '../../../constants/dataTable.js'
import { useTableData } from '../useTableData.js'

jest.mock('../../map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

const mockStore = configureMockStore()

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
        expect(headers).toHaveLength(3)
        expect(headers).toMatchObject([
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(3)
        expect(rows[0]).toMatchObject([
            { value: 'Facility 1', dataKey: 'name' },
            { value: 'facility-1', dataKey: 'id' },
            { value: 'Point', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
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
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Level', dataKey: 'level', type: 'number' },
            { name: 'Parent', dataKey: 'parentName', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(5)
        expect(rows[0]).toMatchObject([
            { value: 'OrgUnitName 1', dataKey: 'name' },
            { value: 'orgunit-id-1', dataKey: 'id' },
            { value: 3, dataKey: 'level' },
            { value: 'Bo', dataKey: 'parentName' },
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
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Value', dataKey: 'rawValue', type: 'number' },
            { name: 'Legend', dataKey: 'legend', type: 'string' },
            { name: 'Range', dataKey: 'range', type: 'string' },
            { name: 'Level', dataKey: 'level', type: 'number' },
            { name: 'Parent', dataKey: 'parentName', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
            {
                name: 'Color',
                dataKey: 'color',
                type: 'string',
                renderer: 'rendercolor',
            },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(9)
        expect(rows[0]).toMatchObject([
            { value: 'Ngelehun CHC', dataKey: 'name' },
            { value: 'thematicId-1', dataKey: 'id' },
            { value: 106.3, dataKey: 'rawValue' },
            { value: 'Great', dataKey: 'legend' },
            { value: '90 – 120', dataKey: 'range' },
            { value: 4, dataKey: 'level' },
            { value: 'Badjia', dataKey: 'parentName' },
            { value: 'Point', dataKey: 'type' },
            { value: '#FFFFB2', dataKey: 'color' },
        ])
        expect(isLoading).toBe(false)
    })

    test('gets current-period Value/Legend/Range/Color for a timeline thematic layer', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'thematic',
            renderingStrategy: 'TIMELINE',
            externalPeriod: { id: '202302', name: 'February 2023' },
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
            { name: 'Name', dataKey: 'name' },
            { name: 'Id', dataKey: 'id' },
            { name: 'Value (February 2023)', dataKey: 'rawValue' },
            { name: 'Legend (February 2023)', dataKey: 'legend' },
            { name: 'Range (February 2023)', dataKey: 'range' },
            { name: 'Level', dataKey: 'level' },
            { name: 'Parent', dataKey: 'parentName' },
            { name: 'Type', dataKey: 'type' },
            { name: 'Color (February 2023)', dataKey: 'color' },
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

    test('adds a raw-value-only extra period column for a timeline thematic layer', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'thematic',
            renderingStrategy: 'TIMELINE',
            externalPeriod: { id: '202302', name: 'February 2023' },
            periods: [
                { id: '202301', name: 'January 2023' },
                { id: '202302', name: 'February 2023' },
            ],
            dataTableColumnConfig: { extraPeriodIds: ['202301'] },
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
        expect(headers).toContainEqual({
            name: 'Value (January 2023)',
            dataKey: 'period_202301_rawValue',
            type: 'number',
        })
        expect(rows[0]).toContainEqual(
            expect.objectContaining({
                value: 100,
                dataKey: 'period_202301_rawValue',
            })
        )
    })

    test('split-by-period thematic layer has no default current-period column, only extras', () => {
        const store = { aggregations: {} }
        const layer = {
            layer: 'thematic',
            renderingStrategy: 'SPLIT_BY_PERIOD',
            externalPeriod: { id: '202302', name: 'February 2023' },
            periods: [{ id: '202301', name: 'January 2023' }],
            dataTableColumnConfig: { extraPeriodIds: ['202301'] },
            valuesByPeriod: {
                202301: { 'ou-1': { value: 100 } },
                202302: {
                    'ou-1': { value: 200, color: '#bbbbbb', legend: 'High' },
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
            { name: 'Name', dataKey: 'name' },
            { name: 'Id', dataKey: 'id' },
            { name: 'Level', dataKey: 'level' },
            { name: 'Parent', dataKey: 'parentName' },
            { name: 'Type', dataKey: 'type' },
            {
                name: 'Value (January 2023)',
                dataKey: 'period_202301_rawValue',
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
        expect(headers).toHaveLength(7)
        expect(headers).toMatchObject([
            { name: 'Org unit', dataKey: 'ouname', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            {
                name: 'Event time',
                dataKey: 'eventdate',
                type: 'date',
                renderer: 'formatTime...',
            },
            { name: 'Last updated on', dataKey: 'lastupdated', type: 'string' },
            { name: 'Event status', dataKey: 'eventstatus', type: 'string' },
            { name: 'Gender', dataKey: 'oZg33kd9taw', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(7)
        expect(rows[0]).toMatchObject([
            { value: 'Lumley Hospital', dataKey: 'ouname' },
            { value: 'a9712323629', dataKey: 'id' },
            { value: '2023-05-15 00:00:00.0', dataKey: 'eventdate' },
            { value: '2018-04-12 20:58:51.31', dataKey: 'lastupdated' },
            { value: 'ACTIVE', dataKey: 'eventstatus' },
            { value: 'Female', dataKey: 'oZg33kd9taw' },
            { value: 'Point', dataKey: 'type' },
        ])
        expect(isLoading).toBe(false)
    })

    test('gets headers and rows for tracked entity layer', () => {
        const store = {
            aggregations: {},
        }
        const layer = {
            layer: 'trackedEntity',
            dataFilters: null,
            headers: [
                {
                    name: 'First name',
                    dataKey: 'w75KJ2mc4zz',
                    valueType: 'TEXT',
                },
                {
                    name: 'Age',
                    dataKey: 'zDhUuAYrxNC',
                    valueType: 'NUMBER',
                },
            ],
            data: [
                {
                    properties: {
                        id: 'PsgJS8BUxZd',
                        w75KJ2mc4zz: 'Gabrielle',
                        zDhUuAYrxNC: 28,
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
        expect(headers).toHaveLength(3)
        expect(headers).toMatchObject([
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'First name', dataKey: 'w75KJ2mc4zz', type: 'string' },
            { name: 'Age', dataKey: 'zDhUuAYrxNC', type: 'number' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(3)
        expect(rows[0]).toMatchObject([
            { value: 'PsgJS8BUxZd', dataKey: 'id' },
            { value: 'Gabrielle', dataKey: 'w75KJ2mc4zz' },
            { value: 28, dataKey: 'zDhUuAYrxNC' },
        ])
        expect(isLoading).toBe(false)
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

        expect(headers).toHaveLength(5)
        expect(headers).toMatchObject([
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
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
        ])
        expect(headers[3].roundFn).toBeInstanceOf(Function)
        expect(headers[4].roundFn).toBeInstanceOf(Function)
        expect(rows).toHaveLength(2)
        expect(rows[0]).toHaveLength(5)
        expect(rows[0]).toMatchObject([
            { value: 'Bo', dataKey: 'name' },
            { value: 'boOu', dataKey: 'id' },
            { value: 'Polygon', dataKey: 'type' },
            { value: 851091, dataKey: 'sum' },
            { value: 47.35, dataKey: 'mean' },
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

        expect(headers).toHaveLength(5)
        expect(headers).toMatchObject([
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
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
        ])
        expect(headers[3].roundFn).toBeInstanceOf(Function)
        expect(headers[4].roundFn).toBeInstanceOf(Function)
        expect(rows).toHaveLength(2)
        expect(rows[0]).toHaveLength(5)
        expect(rows[0]).toMatchObject([
            { value: 'Badija', dataKey: 'name' },
            { value: 'boOU', dataKey: 'id' },
            { value: 'Polygon', dataKey: 'type' },
            { value: 2517, dataKey: 'sum' },
            { value: 3.976, dataKey: 'mean' },
        ])
        expect(isLoading).toBe(false)
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

        const valueColumn = result.current.rows.map((row) => row[2]?.value) // Value column
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

        const valueColumn = result.current.rows.map((row) => row[2]?.value) // Value column
        expect(valueColumn).toEqual([15, 10, 5, null, null])
    })

    test('sorts string values in ascending order with undefined at end', () => {
        const layerWithStringData = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { id: '1', properties: { name: 'Zebra', value: 10 } },
                { id: '2', properties: { name: 'Apple', value: 5 } },
                { id: '3', properties: { name: undefined, value: 20 } },
                { id: '4', properties: { name: 'Banana', value: 15 } },
            ],
        }

        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerWithStringData,
                    sortField: 'name',
                    sortDirection: 'asc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const nameColumn = result.current.rows.map((row) => row[0]?.value) // Name column
        expect(nameColumn).toEqual(['Apple', 'Banana', 'Zebra', undefined])
    })

    test('sorts string values in descending order with undefined at end', () => {
        const layerWithStringData = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { id: '1', properties: { name: 'Zebra', value: 10 } },
                { id: '2', properties: { name: 'Apple', value: 5 } },
                { id: '3', properties: { name: undefined, value: 20 } },
                { id: '4', properties: { name: 'Banana', value: 15 } },
            ],
        }

        const store = {
            aggregations: {},
        }
        const { result } = renderHook(
            () =>
                useTableData({
                    layer: layerWithStringData,
                    sortField: 'name',
                    sortDirection: 'desc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        const nameColumn = result.current.rows.map((row) => row[0]?.value) // Name column
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

        const valueColumn = result.current.rows.map((row) => row[2]?.value) // Value column
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

        const valueColumn = result.current.rows.map((row) => row[2]?.value) // Value column
        expect(valueColumn).toEqual([null, null, null])
    })

    test('falls back to natural (index) order when sortField is null', () => {
        const layerInInputOrder = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { properties: { id: '1', name: 'Item C', rawValue: 3 } },
                { properties: { id: '2', name: 'Item A', rawValue: 1 } },
                { properties: { id: '3', name: 'Item B', rawValue: 2 } },
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
            (row) => row.find((c) => c.dataKey === 'name')?.value
        )
        expect(names).toEqual(['Item C', 'Item A', 'Item B'])
    })

    describe('sorting by selection state', () => {
        const layerWithIds = {
            id: 'test-layer',
            layer: 'thematic',
            dataFilters: null,
            data: [
                { properties: { id: '1', name: 'Item A' } },
                { properties: { id: '2', name: 'Item B' } },
                { properties: { id: '3', name: 'Item C' } },
                { properties: { id: '4', name: 'Item D' } },
                { properties: { id: '5', name: 'Item E' } },
            ],
        }
        const store = { aggregations: {} }

        const renderSorted = (sortDirection) =>
            renderHook(
                () =>
                    useTableData({
                        layer: layerWithIds,
                        sortField: SENTINEL_SELECTED_ROW,
                        sortDirection,
                        selectedIdSet: new Set(['2', '4']),
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                }
            ).result

        test('ascending (the default on first click) puts selected rows first', () => {
            const { current } = renderSorted('asc')
            const ids = current.rows.map(
                (row) => row.find((c) => c.dataKey === 'id')?.value
            )
            expect(ids.slice(0, 2).sort()).toEqual(['2', '4'])
            expect(ids.slice(2).sort()).toEqual(['1', '3', '5'])
        })

        test('descending puts selected rows last', () => {
            const { current } = renderSorted('desc')
            const ids = current.rows.map(
                (row) => row.find((c) => c.dataKey === 'id')?.value
            )
            expect(ids.slice(0, 3).sort()).toEqual(['1', '3', '5'])
            expect(ids.slice(3).sort()).toEqual(['2', '4'])
        })
    })
})

describe('useTableData showOnlyFeaturesInView', () => {
    const store = { aggregations: {} }
    const bounds = [-10, -10, 10, 10]

    const layer = {
        id: 'test-layer',
        layer: 'orgUnit',
        dataFilters: null,
        data: [
            {
                id: 'inview',
                properties: { id: 'inview', name: 'In view' },
                geometry: { type: 'Point', coordinates: [0, 0] },
            },
            {
                id: 'outofview',
                properties: { id: 'outofview', name: 'Out of view' },
                geometry: { type: 'Point', coordinates: [50, 50] },
            },
        ],
    }

    const renderTableData = (props) =>
        renderHook(() => useTableData(props), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        }).result

    test('includes all rows when the toggle is off', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            showOnlyFeaturesInView: false,
            mapBounds: bounds,
        })
        expect(current.rows).toHaveLength(2)
    })

    test('excludes features outside the current map bounds when the toggle is on', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            showOnlyFeaturesInView: true,
            mapBounds: bounds,
        })
        expect(current.rows).toHaveLength(1)
        expect(current.rows[0].find((c) => c.dataKey === 'name').value).toBe(
            'In view'
        )
    })

    test('excludes features without geometry when the toggle is on', () => {
        const layerWithoutCoords = {
            ...layer,
            data: [layer.data[0]],
            dataWithoutCoords: [
                {
                    id: 'nogeom',
                    properties: { id: 'nogeom', name: 'No geometry' },
                    geometry: null,
                },
            ],
        }

        const { current } = renderTableData({
            layer: layerWithoutCoords,
            sortField: 'name',
            sortDirection: 'asc',
            showOnlyFeaturesInView: true,
            mapBounds: bounds,
        })
        expect(current.rows).toHaveLength(1)
        expect(current.rows[0].find((c) => c.dataKey === 'name').value).toBe(
            'In view'
        )
    })
})

describe('useTableData selectionFilter', () => {
    const store = { aggregations: {} }

    const layer = {
        id: 'test-layer',
        layer: 'orgUnit',
        dataFilters: null,
        data: [
            { id: 'a', properties: { id: 'a', name: 'Item A' } },
            { id: 'b', properties: { id: 'b', name: 'Item B' } },
        ],
    }

    const renderTableData = (props) =>
        renderHook(() => useTableData(props), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        }).result

    test('includes all rows when no filter is applied', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            selectionFilter: [],
            selectedIdSet: new Set(['a']),
        })
        expect(current.rows).toHaveLength(2)
    })

    test('includes only selected rows when filtered to "selected"', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            selectionFilter: ['selected'],
            selectedIdSet: new Set(['a']),
        })
        expect(current.rows).toHaveLength(1)
        expect(current.rows[0].find((c) => c.dataKey === 'name').value).toBe(
            'Item A'
        )
    })

    test('includes only non-selected rows when filtered to "not-selected"', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            selectionFilter: ['not-selected'],
            selectedIdSet: new Set(['a']),
        })
        expect(current.rows).toHaveLength(1)
        expect(current.rows[0].find((c) => c.dataKey === 'name').value).toBe(
            'Item B'
        )
    })

    test('includes all rows when both options are checked', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            selectionFilter: ['selected', 'not-selected'],
            selectedIdSet: new Set(['a']),
        })
        expect(current.rows).toHaveLength(2)
    })

    test('shows no rows when filtered to "selected" and nothing is selected', () => {
        const { current } = renderTableData({
            layer,
            sortField: 'name',
            sortDirection: 'asc',
            selectionFilter: ['selected'],
            selectedIdSet: new Set(),
        })
        expect(current.rows).toHaveLength(0)
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
                        name: 'Org unit 1',
                        rawValue: 10,
                        legend: 'High',
                        range: '5 - 15',
                        level: 1,
                        parentName: 'Country',
                        type: 'Point',
                        color: '#ff0000',
                    },
                },
                {
                    properties: {
                        id: 'ou2',
                        name: 'Org unit 2',
                        rawValue: 20,
                        legend: 'Low',
                        range: '15 - 25',
                        level: 1,
                        parentName: 'Country',
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
        expect(current.columnOptions.name).toEqual([
            { value: 'Org unit 1' },
            { value: 'Org unit 2' },
        ])
        expect(current.columnOptions.id).toEqual([
            { value: 'ou1' },
            { value: 'ou2' },
        ])
        expect(current.columnOptions.parentName).toEqual([{ value: 'Country' }])
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
                        name: 'Org unit 1',
                        level: 1,
                        parentName: 'Country',
                        type: 'Point',
                    },
                },
                {
                    properties: {
                        id: 'ou2',
                        name: 'Org unit 2',
                        level: 1,
                        parentName: '',
                        type: 'Point',
                    },
                },
                {
                    properties: {
                        id: 'ou3',
                        name: 'Org unit 3',
                        level: 1,
                        // parentName omitted entirely (undefined)
                        type: 'Point',
                    },
                },
            ],
        }

        const { current } = renderTableData(layer)

        expect(current.columnOptions.parentName).toEqual([
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
                        name: 'Org unit 1',
                        rawValue: 10,
                        legend: 'High',
                        level: 1,
                        parentName: 'Country',
                        type: 'Point',
                    },
                },
                {
                    properties: {
                        id: 'ou2',
                        name: 'Org unit 2',
                        rawValue: 20,
                        legend: 'Low',
                        level: 1,
                        parentName: 'Country',
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
                    sortDirection: 'desc',
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        )

        // Sorted column (name, desc) is reversed to match...
        expect(result.current.columnOptions.name).toEqual([
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

describe('useTableData globalSearch', () => {
    const store = { aggregations: {} }

    const layer = {
        layer: 'orgUnit',
        dataFilters: null,
        data: [
            { properties: { id: 'a', name: 'Kampala', parentName: 'Uganda' } },
            { properties: { id: 'b', name: 'Nairobi', parentName: 'Kenya' } },
        ],
    }

    const renderTableData = (globalSearch) =>
        renderHook(
            () =>
                useTableData({
                    layer,
                    sortField: 'name',
                    sortDirection: 'asc',
                    globalSearch,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            }
        ).result

    test('includes all rows when the search string is empty', () => {
        const { current } = renderTableData('')
        expect(current.rows).toHaveLength(2)
    })

    test('matches case-insensitively across any string column', () => {
        const { current } = renderTableData('uganda')
        expect(current.rows).toHaveLength(1)
        expect(current.rows[0].find((c) => c.dataKey === 'name').value).toBe(
            'Kampala'
        )
    })

    test('shows no rows when nothing matches', () => {
        const { current } = renderTableData('addis ababa')
        expect(current.rows).toHaveLength(0)
    })
})
