import {
    getBounds,
    addStyleDataItem,
    createEventFeature,
    buildEventGeometryGetter,
    createEventFeatures,
    getGeojsonDisplayData,
} from '../geojson.js'

jest.mock('../../components/map/MapApi.js', () => ({
    poleOfInaccessibility: jest.fn(),
}))

describe('geojson utils', () => {
    describe('createEventFeature', () => {
        const headers = [{ name: 'C1' }, { name: 'C2' }]
        const dummyID = 'IAmAnID'
        const dummyEventRow = ['What is the question?', 42]
        const dummyGeometry = {
            geometry: { coordinates: [0, 0], type: 'Point' },
        }
        const dummyGetGeometry = jest.fn(() => dummyGeometry)
        it('Should create a single feature from a single event with no Names passed', () => {
            expect(
                createEventFeature(
                    headers,
                    {},
                    [],
                    dummyEventRow,
                    dummyID,
                    dummyGetGeometry
                )
            ).toEqual({
                type: 'Feature',
                id: dummyID,
                properties: {
                    id: dummyID,
                    type: dummyGeometry.type,
                    [headers[0].name]: dummyEventRow[0],
                    [headers[1].name]: dummyEventRow[1],
                },
                geometry: dummyGeometry,
            })
        })

        it('Should convert property names when they match passed names', () => {
            const names = {
                [headers[0].name]: 'Column #1',
            }
            expect(
                createEventFeature(
                    headers,
                    names,
                    [],
                    dummyEventRow,
                    dummyID,
                    dummyGetGeometry
                )
            ).toEqual({
                type: 'Feature',
                id: dummyID,
                properties: {
                    id: dummyID,
                    type: dummyGeometry.type,
                    [names[headers[0].name]]: dummyEventRow[0],
                    [headers[1].name]: dummyEventRow[1],
                },
                geometry: dummyGeometry,
            })
        })
    })

    describe('buildEventGeometryGetter', () => {
        const headers = [
            { name: 'id' },
            { name: 'geometry' },
            { name: 'myStringCoordinates' },
            { name: 'SomeField' },
            { name: 'myArrayCoordinates' },
            { name: 'SomeOtherField' },
        ]

        const stringCoords = [9, 14.3]
        const arrayCoords = [21.1, 42.2]
        const point = {
            type: 'Point',
            coordinates: [0, 0],
        }
        const dummyEvent = [
            'MyID',
            JSON.stringify(point),
            JSON.stringify(stringCoords),
            54321,
            arrayCoords,
            1234,
        ]
        it('Should default to fetching geometry column', () => {
            const getter = buildEventGeometryGetter(headers)
            expect(getter(dummyEvent)).toEqual(point)
        })
    })

    describe('createEventFeatures', () => {
        const headers = [
            { name: 'SomeField', column: 'SomeField Column' },
            { name: 'psi', column: 'psi Column' },
            { name: 'TheRealID', column: 'TheRealID Column' },
            { name: 'geometry', column: 'Geometry Column' },
            { name: 'SomeOtherField', column: 'SomeOtherField Column' },
        ]
        const metaData = {
            items: headers.reduce(
                (out, header) => ({
                    ...out,
                    [header.name]: header.name + 'META',
                }),
                {}
            ),
        }

        const point = {
            type: 'Point',
            coordinates: [0, 0],
        }
        const pointString = JSON.stringify(point)

        const rows = [
            ['ping', 'psi0', 'id0', pointString, 'pong'],
            ['foo', 'psi1', 'id1', pointString, 'bar'],
            ['bill', 'psi2', 'id2', pointString, 'gates'],
            ['paul', 'psi3', 'id3', pointString, 'allen'],
        ]
        const response = {
            headers,
            rows,
            metaData,
        }

        const defaultNames = headers.reduce(
            (names, header) => ({
                ...names,
                [header.name]: header.column,
            }),
            {}
        )

        it('Should create an array of features with the proper field mappings', () => {
            const out = createEventFeatures(response)
            expect(out.names).toEqual(defaultNames)
            expect(out.data).toEqual(
                rows.map((row) => ({
                    type: 'Feature',
                    id: row[1],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [header.column]: row[i],
                        }),
                        { id: row[1], type: point.type }
                    ),
                    geometry: point,
                }))
            )
        })

        it('Should use alternative ID column', () => {
            const out = createEventFeatures(response, { idCol: 'TheRealID' })
            expect(out.names).toEqual(defaultNames)
            expect(out.data).toEqual(
                rows.map((row) => ({
                    type: 'Feature',
                    id: row[2],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [header.column]: row[i],
                        }),
                        { id: row[2], type: point.type }
                    ),
                    geometry: point,
                }))
            )
        })

        it('Should use ID output scheme', () => {
            const out = createEventFeatures(response, {
                outputIdScheme: 'ID',
            })
            expect(out.names).toEqual(defaultNames)
            expect(out.data).toEqual(
                rows.map((row) => ({
                    type: 'Feature',
                    id: row[1],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [header.name]: row[i],
                        }),
                        { id: row[1], type: point.type }
                    ),
                    geometry: point,
                }))
            )
        })

        it('Should use custom name mappings', () => {
            const columnNames = headers.reduce(
                (out, header) => ({
                    ...out,
                    [header.name]: `${header.name} CUSTOM`,
                }),
                {}
            )
            const out = createEventFeatures(response, {
                columnNames,
            })
            expect(out.names).toEqual(columnNames)
            expect(out.data).toEqual(
                rows.map((row) => ({
                    type: 'Feature',
                    id: row[1],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [`${header.name} CUSTOM`]: row[i],
                        }),
                        { id: row[1], type: point.type }
                    ),
                    geometry: point,
                }))
            )
        })
    })

    describe('addStyleDataItem', () => {
        const dummyDataItems = ['test', 'copy', 42] // Types shouldn't be coerced
        it('Should return a new array with identical items if no styleDataItem passed', () => {
            const result = addStyleDataItem(dummyDataItems)
            expect(result).not.toBe(dummyDataItems) // New array, not ===
            expect(result).toEqual(dummyDataItems)
        })
        it('Should append a properly-structured data item', () => {
            const newItem = {
                id: 'id',
                name: 'name',
            }
            const result = addStyleDataItem(dummyDataItems, newItem)
            expect(result).toHaveLength(dummyDataItems.length + 1)
            expect(result.slice(0, -1)).toEqual(dummyDataItems)
            expect(result[result.length - 1]).toEqual({
                dimension: newItem.id,
                name: newItem.name,
            })
        })
    })

    describe('getBounds', () => {
        it('Should return null when passed null', () => {
            expect(getBounds()).toBeNull()
        })
        it('Should correctly parse a simple bounding box', () => {
            const bbox = getBounds('[0][1][2][3]')
            expect(bbox).toEqual([
                ['0', '1'],
                ['2', '3'],
            ])
        })
    })

    describe('getGeojsonDisplayData', () => {
        const TYPE_NUMBER = 'number'
        const TYPE_STRING = 'string'

        const getPrecision = jest.fn()
        const getRoundToPrecisionFn = jest.fn()

        it('should return an empty array for an empty object', () => {
            expect(getGeojsonDisplayData({}, [])).toEqual([])
        })

        it('should correctly process a data item with number and string values', () => {
            const dataItem = { a: 1, b: '2' }
            const allData = [dataItem]

            getPrecision.mockReturnValue(0)
            getRoundToPrecisionFn.mockReturnValue(Math.round)

            const res = getGeojsonDisplayData(dataItem, allData)

            expect(res).toMatchObject([
                {
                    name: 'a',
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    // roundFn: getRoundToPrecisionFn(),
                    value: 1,
                },
                {
                    name: 'b',
                    dataKey: 'b',
                    type: TYPE_STRING,
                    roundFn: null,
                    value: '2',
                },
            ])

            expect(typeof res[0].roundFn).toBe('function')
        })

        it('should correctly process a data item with only number values', () => {
            const dataItem = { a: 1.23, b: 4.56 }
            const allData = [{ ...dataItem }, { a: 7.89, b: 0.12 }]

            getPrecision.mockReturnValue(2)
            getRoundToPrecisionFn.mockReturnValue(
                (value) => Math.round(value * 100) / 100
            )
            const res = getGeojsonDisplayData(dataItem, allData)
            expect(res).toMatchObject([
                {
                    name: 'a',
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    // roundFn: getRoundToPrecisionFn(),
                    value: 1.23,
                },
                {
                    name: 'b',
                    dataKey: 'b',
                    type: TYPE_NUMBER,
                    // roundFn: getRoundToPrecisionFn(),
                    value: 4.56,
                },
            ])

            expect(typeof res[0].roundFn).toBe('function')
            expect(typeof res[1].roundFn).toBe('function')
        })

        it('should exclude properties that are objects', () => {
            const dataItem = { a: 1, b: '2', c: { d: 3 } }
            const allData = [dataItem]

            getPrecision.mockReturnValue(0)
            getRoundToPrecisionFn.mockReturnValue(Math.round)

            const res = getGeojsonDisplayData(dataItem, allData)
            expect(res).toMatchObject([
                {
                    name: 'a',
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    // roundFn: Math.round,
                    value: 1,
                },
                {
                    name: 'b',
                    dataKey: 'b',
                    type: TYPE_STRING,
                    roundFn: null,
                    value: '2',
                },
            ])

            expect(typeof res[0].roundFn).toBe('function')
        })
    })
})
