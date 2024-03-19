import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { useTableData } from '../useTableData.js'

jest.mock('../../map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

const mockStore = configureMockStore()

describe('useTableData', () => {
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
        expect(headers).toHaveLength(4)
        expect(headers).toMatchObject([
            { name: 'Index', dataKey: 'index', type: 'number' },
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(4)
        expect(rows[0]).toMatchObject([
            { value: 0, dataKey: 'index' },
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
        expect(headers).toHaveLength(6)
        expect(headers).toMatchObject([
            { name: 'Index', dataKey: 'index', type: 'number' },
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Level', dataKey: 'level', type: 'number' },
            { name: 'Parent', dataKey: 'parentName', type: 'string' },
            { name: 'Type', dataKey: 'type', type: 'string' },
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveLength(6)
        expect(rows[0]).toMatchObject([
            { value: 0, dataKey: 'index' },
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
                        range: '90 - 120',
                        value: 106.3,
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
            { name: 'Index', dataKey: 'index', type: 'number' },
            { name: 'Name', dataKey: 'name', type: 'string' },
            { name: 'Id', dataKey: 'id', type: 'string' },
            { name: 'Value', dataKey: 'value', type: 'number' },
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
        expect(rows[0]).toHaveLength(10)
        expect(rows[0]).toMatchObject([
            { value: 0, dataKey: 'index' },
            { value: 'Ngelehun CHC', dataKey: 'name' },
            { value: 'thematicId-1', dataKey: 'id' },
            { value: 106.3, dataKey: 'value' },
            { value: 'Great', dataKey: 'legend' },
            { value: '90 - 120', dataKey: 'range' },
            { value: 4, dataKey: 'level' },
            { value: 'Badjia', dataKey: 'parentName' },
            { value: 'Point', dataKey: 'type' },
            { value: '#FFFFB2', dataKey: 'color' },
        ])
        expect(isLoading).toBe(false)
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
        expect(headers).toHaveLength(8)
        expect(headers).toMatchObject([
            { name: 'Index', dataKey: 'index', type: 'number' },
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
        expect(rows[0]).toHaveLength(8)
        expect(rows[0]).toMatchObject([
            { value: 0, dataKey: 'index' },
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

        expect(headers).toHaveLength(6)
        expect(headers).toMatchObject([
            { name: 'Index', dataKey: 'index', type: 'number' },
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
        expect(headers[4].roundFn).toBeInstanceOf(Function)
        expect(headers[5].roundFn).toBeInstanceOf(Function)
        expect(rows).toHaveLength(2)
        expect(rows[0]).toHaveLength(6)
        expect(rows[0]).toMatchObject([
            { value: 0, dataKey: 'index' },
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

        expect(headers).toHaveLength(6)
        expect(headers).toMatchObject([
            { name: 'Index', dataKey: 'index', type: 'number' },
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
        expect(headers[4].roundFn).toBeInstanceOf(Function)
        expect(headers[5].roundFn).toBeInstanceOf(Function)
        expect(rows).toHaveLength(2)
        expect(rows[0]).toHaveLength(6)
        expect(rows[0]).toMatchObject([
            { value: 0, dataKey: 'index' },
            { value: 'Badija', dataKey: 'name' },
            { value: 'boOU', dataKey: 'id' },
            { value: 'Polygon', dataKey: 'type' },
            { value: 2517, dataKey: 'sum' },
            { value: 3.976, dataKey: 'mean' },
        ])
        expect(isLoading).toBe(false)
    })
})
