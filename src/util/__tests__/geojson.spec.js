import FileSaver from 'file-saver'
import {
    createGeoJsonBlob,
    downloadGeoJson,
    getBounds,
    addStyleDataItem,
    createEventFeature,
    buildEventGeometryGetter,
    createEventFeatures,
} from '../geojson.js'

jest.mock('../../components/map/MapApi.js', () => ({
    poleOfInaccessibility: jest.fn(),
}))

// Since we're not in a browser environment we unfortunately have to mock FileSaver and Blob
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

global.Blob = function (content, options) {
    return { content, options }
}

const sampleData = [
    {
        type: 'Feature',
        id: '1234',
        geometry: {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [0, 0],
                    [1, 1],
                    [2, 3],
                    [0, 3],
                ],
            ],
        },
        attributes: {
            testAttribute: 'someValue',
            attr2: 'someOtherValue',
        },
    },
    {
        type: 'Feature',
        id: '1234',
        geometry: {
            type: 'Point',
            coordinates: [
                [
                    [0, 0],
                    [1, 1],
                    [2, 3],
                    [0, 3],
                ],
            ],
        },
        attributes: {
            testAttribute: 'someValue',
            attr2: 'someOtherValue',
        },
    },
]

const geoJSONString = JSON.stringify({
    type: 'FeatureCollection',
    features: sampleData,
})

describe('geojson utils', () => {
    describe('createGeoJsonBlob and downloadGeoJson', () => {
        let blob
        it('should generate a geoJSON string and set content-type correctly', () => {
            blob = createGeoJsonBlob(sampleData)
            expect(blob).toMatchObject({
                content: [geoJSONString],
                options: {
                    type: 'application/json;charset=utf-8',
                },
            })
        })
        it('should escape name whitespace and call saveAs', () => {
            downloadGeoJson({
                name: 'Testing geo-json    download',
                data: sampleData,
            })
            expect(FileSaver.saveAs).toHaveBeenCalledWith(
                blob,
                'Testing_geo-json_download.geojson'
            )
        })
    })

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

        it('Should parse a string coordinate', () => {
            const getter = buildEventGeometryGetter(
                headers,
                'myStringCoordinates'
            )
            expect(getter(dummyEvent)).toEqual({
                type: 'Point',
                coordinates: stringCoords,
            })
        })

        it('Should parse a coordinate array', () => {
            const getter = buildEventGeometryGetter(
                headers,
                'myArrayCoordinates'
            )
            expect(getter(dummyEvent)).toEqual({
                type: 'Point',
                coordinates: arrayCoords,
            })
        })

        it('Should return null on integer value', () => {
            const getter = buildEventGeometryGetter(headers, 'SomeField')
            expect(getter(dummyEvent)).toEqual(null)
        })

        it('Should return an empty array on invalid string value', () => {
            const getter = buildEventGeometryGetter(headers, 'id')
            expect(getter(dummyEvent)).toEqual(null)
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
})
