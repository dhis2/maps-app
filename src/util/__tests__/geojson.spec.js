import {
    getBounds,
    addStyleDataItem,
    createEventFeature,
    buildEventGeometryGetter,
    createEventFeatures,
    getGeojsonDisplayData,
    buildGeoJsonFeatures,
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

        it('should return an empty array for an empty object', () => {
            expect(getGeojsonDisplayData({}, [])).toEqual([])
        })

        it('should correctly process a data item with number and string values', () => {
            expect(
                getGeojsonDisplayData({ properties: { a: 1, b: '2' } })
            ).toMatchObject([
                {
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1,
                },
                {
                    dataKey: 'b',
                    type: TYPE_STRING,
                    value: '2',
                },
            ])
        })

        it('should correctly process a data item with only number values', () => {
            expect(
                getGeojsonDisplayData({
                    properties: { a: 1.23, b: 4.56 },
                })
            ).toMatchObject([
                {
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1.23,
                },
                {
                    dataKey: 'b',
                    type: TYPE_NUMBER,
                    value: 4.56,
                },
            ])
        })

        it('should exclude properties that are objects', () => {
            expect(
                getGeojsonDisplayData({
                    properties: { a: 1, b: '2', c: { d: 3 } },
                })
            ).toMatchObject([
                {
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1,
                },
                {
                    dataKey: 'b',
                    type: TYPE_STRING,
                    value: '2',
                },
            ])
        })

        it('should remove id property that was added by the app', () => {
            expect(
                getGeojsonDisplayData({
                    properties: { id: 1234, a: 1 },
                    __isDhis2propertyId: true,
                })
            ).toMatchObject([
                {
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1,
                },
            ])
        })

        it('should remove not id property that was an actual property', () => {
            expect(
                getGeojsonDisplayData({
                    properties: { id: 1234.1, a: 1 },
                })
            ).toMatchObject([
                {
                    dataKey: 'id',
                    type: TYPE_NUMBER,
                    value: 1234.1,
                },
                {
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1,
                },
            ])
        })
    })

    describe('buildGeoJsonFeatures', () => {
        it('should handle a FeatureCollection with multiple features', () => {
            const geoJson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        id: '33',
                        geometry: {
                            type: 'Point',
                            coordinates: [125.6, 10.1],
                        },
                        properties: {
                            name: 'Dinagat Islands',
                        },
                    },
                    {
                        type: 'Feature',
                        id: '44',
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [125.6, 10.1],
                                [125.7, 10.2],
                            ],
                        },
                        properties: {
                            name: 'Surigao del Norte',
                        },
                    },
                ],
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result[0].type).toEqual('Feature')
            expect(result[0].geometry).toEqual(geoJson.features[0].geometry)
            expect(result[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '33',
            })
            expect(result[0].id).toEqual('33')
            expect(result[0].__isDhis2propertyId).toEqual(true)

            expect(result[1].type).toEqual('Feature')
            expect(result[1].geometry).toEqual(geoJson.features[1].geometry)
            expect(result[1].properties).toEqual({
                name: 'Surigao del Norte',
                id: '44',
            })
            expect(result[1].id).toEqual('44')
            expect(result[1].__isDhis2propertyId).toEqual(true)
        })
        it('should handle a Feature', () => {
            const geoJson = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                },
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result.length).toEqual(1)
            expect(result[0].type).toEqual('Feature')
            expect(result[0].geometry).toEqual(geoJson.geometry)
            expect(result[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: 1,
            })
            expect(result[0].id).toEqual(1)
            expect(result[0].__isDhis2propertyId).toEqual(true)
        })

        it('should handle a raw geometry type', () => {
            const geoJson = {
                type: 'Point',
                coordinates: [125.6, 10.1],
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result.length).toEqual(1)
            expect(result[0].type).toEqual('Feature')
            expect(result[0].id).toEqual(1)
            expect(result[0].properties).toEqual({ id: 1 })
            expect(result[0].__isDhis2propertyId).toEqual(true)
        })

        it('should handle a GeometryCollection', () => {
            const geoJson = {
                type: 'GeometryCollection',
                geometries: [
                    {
                        type: 'Point',
                        coordinates: [125.6, 10.1],
                    },
                    {
                        type: 'LineString',
                        coordinates: [
                            [125.6, 10.1],
                            [125.7, 10.2],
                        ],
                    },
                ],
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result.length).toEqual(2)

            expect(result[0].type).toEqual('Feature')
            expect(result[0].geometry).toEqual({
                type: 'Point',
                coordinates: [125.6, 10.1],
            })
            expect(result[0].properties).toEqual({ id: 1 })
            expect(result[0].id).toEqual(1)
            expect(result[0].__isDhis2propertyId).toEqual(true)

            expect(result[1].type).toEqual('Feature')
            expect(result[1].geometry).toEqual({
                type: 'LineString',
                coordinates: [
                    [125.6, 10.1],
                    [125.7, 10.2],
                ],
            })
            expect(result[1].properties).toEqual({ id: 2 })
            expect(result[1].id).toEqual(2)
            expect(result[1].__isDhis2propertyId).toEqual(true)
        })

        it('should add a properties.id property if it does not exist', () => {
            const geoJson = {
                type: 'Feature',
                id: '123',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                },
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result[0].type).toEqual('Feature')
            expect(result[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '123',
            })
            expect(result[0].id).toEqual('123')
            expect(result[0].__isDhis2propertyId).toEqual(true)
        })

        it('should add a feature.id property if it does not exist', () => {
            const geoJson = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                    id: '123',
                },
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result[0].type).toEqual('Feature')
            expect(result[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '123',
            })
            expect(result[0].id).toEqual('123')
            expect(result[0].__isDhis2propertyId).toBe(undefined)
        })

        it('should not add ids if they exist already', () => {
            const geoJson = {
                type: 'Feature',
                id: 456,
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                    id: '123',
                },
            }

            const result = buildGeoJsonFeatures(geoJson)
            expect(result[0].type).toEqual('Feature')
            expect(result[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '123',
            })
            expect(result[0].id).toEqual(456)
            expect(result[0].__isDhis2propertyId).toBe(undefined)
        })
    })
})
