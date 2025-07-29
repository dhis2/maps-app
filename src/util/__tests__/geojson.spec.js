import {
    GEO_TYPE_POINT,
    GEO_TYPE_FEATURE,
    CENTROID_FORMAT_GEOJSON,
    getBounds,
    getCentroid,
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
            geometry: { coordinates: [0, 0], type: GEO_TYPE_POINT },
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
                type: GEO_TYPE_FEATURE,
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
                type: GEO_TYPE_FEATURE,
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
            type: GEO_TYPE_POINT,
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
            type: GEO_TYPE_POINT,
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
                    type: GEO_TYPE_FEATURE,
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
                    type: GEO_TYPE_FEATURE,
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
                    type: GEO_TYPE_FEATURE,
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
                    type: GEO_TYPE_FEATURE,
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
                    name: 'a',
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1,
                },
                {
                    name: 'b',
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
                    name: 'a',
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1.23,
                },
                {
                    name: 'b',
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
                    name: 'a',
                    dataKey: 'a',
                    type: TYPE_NUMBER,
                    value: 1,
                },
                {
                    name: 'b',
                    dataKey: 'b',
                    type: TYPE_STRING,
                    value: '2',
                },
            ])
        })

        it('should remove id property that was added by the app', () => {
            expect(
                getGeojsonDisplayData({
                    properties: { id: '__dhis2propertyid__333', a: 1 },
                })
            ).toMatchObject([
                {
                    name: 'a',
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
                    name: 'id',
                    dataKey: 'id',
                    type: TYPE_NUMBER,
                    value: 1234.1,
                },
                {
                    name: 'a',
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
                        type: GEO_TYPE_FEATURE,
                        id: '33',
                        geometry: {
                            type: GEO_TYPE_POINT,
                            coordinates: [125.6, 10.1],
                        },
                        properties: {
                            name: 'Dinagat Islands',
                        },
                    },
                    {
                        type: GEO_TYPE_FEATURE,
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

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT, 'LineString'])
            expect(featureCollection[0].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[0].geometry).toEqual(
                geoJson.features[0].geometry
            )
            expect(featureCollection[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '__dhis2propertyid__0',
            })
            expect(featureCollection[0].id).toEqual('33')

            expect(featureCollection[1].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[1].geometry).toEqual(
                geoJson.features[1].geometry
            )
            expect(featureCollection[1].properties).toEqual({
                name: 'Surigao del Norte',
                id: '__dhis2propertyid__1',
            })
            expect(featureCollection[1].id).toEqual('44')
        })

        it('should handle a FeatureCollection with multi geometry types', () => {
            const geoJson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: GEO_TYPE_FEATURE,
                        geometry: {
                            type: GEO_TYPE_POINT,
                        },
                        properties: {
                            id: 'thefeature100',
                        },
                    },
                    {
                        type: GEO_TYPE_FEATURE,
                        geometry: {
                            type: 'LineString',
                        },
                        properties: {
                            id: 'thefeature101',
                        },
                    },
                    {
                        type: GEO_TYPE_FEATURE,
                        geometry: {
                            type: 'Polygon',
                        },
                        properties: {
                            id: 'thefeature102',
                        },
                    },
                    {
                        type: GEO_TYPE_FEATURE,
                        geometry: {
                            type: 'MultiPoint',
                        },
                        properties: {
                            id: 'thefeature103',
                        },
                    },
                    {
                        type: GEO_TYPE_FEATURE,
                        geometry: {
                            type: 'MultiLineString',
                        },
                        properties: {
                            id: 'thefeature104',
                        },
                    },
                    {
                        type: GEO_TYPE_FEATURE,
                        geometry: {
                            type: 'MultiPolygon',
                        },
                        properties: {
                            id: 'thefeature105',
                        },
                    },
                ],
            }

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT, 'LineString', 'Polygon'])
            expect(featureCollection[5].properties).toEqual({
                id: 'thefeature105',
            })
        })

        it('should handle a Feature', () => {
            const geoJson = {
                type: GEO_TYPE_FEATURE,
                geometry: {
                    type: GEO_TYPE_POINT,
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                },
            }

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT])
            expect(featureCollection.length).toEqual(1)
            expect(featureCollection[0].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[0].geometry).toEqual(geoJson.geometry)
            expect(featureCollection[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '__dhis2propertyid__0',
            })
            expect(featureCollection[0].id).toBe(undefined)
        })

        it('should handle a raw geometry type', () => {
            const geoJson = {
                type: GEO_TYPE_POINT,
                coordinates: [125.6, 10.1],
            }

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT])
            expect(featureCollection.length).toEqual(1)
            expect(featureCollection[0].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[0].id).toBe(undefined)
            expect(featureCollection[0].properties).toEqual({
                id: '__dhis2propertyid__0',
            })
        })

        it('should handle a GeometryCollection', () => {
            const geoJson = {
                type: 'GeometryCollection',
                geometries: [
                    {
                        type: GEO_TYPE_POINT,
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

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT, 'LineString'])
            expect(featureCollection.length).toEqual(2)

            expect(featureCollection[0].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[0].geometry).toEqual({
                type: GEO_TYPE_POINT,
                coordinates: [125.6, 10.1],
            })
            expect(featureCollection[0].properties).toEqual({
                id: '__dhis2propertyid__0',
            })
            expect(featureCollection[0].id).toBe(undefined)

            expect(featureCollection[1].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[1].geometry).toEqual({
                type: 'LineString',
                coordinates: [
                    [125.6, 10.1],
                    [125.7, 10.2],
                ],
            })
            expect(featureCollection[1].properties).toEqual({
                id: '__dhis2propertyid__1',
            })
            expect(featureCollection[1].id).toBe(undefined)
        })

        it('should add a properties.id property if it does not exist', () => {
            const geoJson = {
                type: GEO_TYPE_FEATURE,
                id: '123',
                geometry: {
                    type: GEO_TYPE_POINT,
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                },
            }

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT])
            expect(featureCollection[0].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '__dhis2propertyid__0',
            })
            expect(featureCollection[0].id).toEqual('123')
        })

        it('should not add ids if they exist already', () => {
            const geoJson = {
                type: GEO_TYPE_FEATURE,
                id: 456,
                geometry: {
                    type: GEO_TYPE_POINT,
                    coordinates: [125.6, 10.1],
                },
                properties: {
                    name: 'Dinagat Islands',
                    id: '123',
                },
            }

            const { featureCollection, types } = buildGeoJsonFeatures(geoJson)
            expect(types).toEqual([GEO_TYPE_POINT])
            expect(featureCollection[0].type).toEqual(GEO_TYPE_FEATURE)
            expect(featureCollection[0].properties).toEqual({
                name: 'Dinagat Islands',
                id: '123',
            })
            expect(featureCollection[0].id).toEqual(456)
        })
    })

    describe('getCentroid', () => {
        const polygon = {
            type: 'Polygon',
            coordinates: [
                [
                    [0, 0],
                    [4, 0],
                    [4, 4],
                    [0, 4],
                    [0, 0],
                ],
            ],
        }

        const multipolygon = {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [
                        [0, 0],
                        [2, 0],
                        [2, 2],
                        [0, 2],
                        [0, 0],
                    ],
                ],
                [
                    [
                        [5, 5],
                        [7, 5],
                        [7, 7],
                        [5, 7],
                        [5, 5],
                    ],
                ],
            ],
        }

        const point = {
            type: GEO_TYPE_POINT,
            coordinates: [1, 2],
        }

        it('returns centroid as array for Polygon', () => {
            const centroid = getCentroid(polygon)
            expect(Array.isArray(centroid)).toBe(true)
            expect(centroid.length).toBe(2)
            expect(Number.isFinite(centroid[0])).toBe(true)
            expect(Number.isFinite(centroid[1])).toBe(true)
        })

        it('returns centroid as GeoJSON for Polygon with format=geojson', () => {
            const centroid = getCentroid(polygon, CENTROID_FORMAT_GEOJSON)
            expect(centroid).toEqual({
                type: GEO_TYPE_POINT,
                coordinates: expect.any(Array),
            })
            expect(centroid.coordinates.length).toBe(2)
            expect(Number.isFinite(centroid.coordinates[0])).toBe(true)
            expect(Number.isFinite(centroid.coordinates[1])).toBe(true)
        })

        it('returns centroid as array for MultiPolygon', () => {
            const centroid = getCentroid(multipolygon)
            expect(Array.isArray(centroid)).toBe(true)
            expect(centroid.length).toBe(2)
            expect(Number.isFinite(centroid[0])).toBe(true)
            expect(Number.isFinite(centroid[1])).toBe(true)
        })

        it('returns centroid as GeoJSON for MultiPolygon with format=geojson', () => {
            const centroid = getCentroid(multipolygon, CENTROID_FORMAT_GEOJSON)
            expect(centroid).toEqual({
                type: GEO_TYPE_POINT,
                coordinates: expect.any(Array),
            })
            expect(centroid.coordinates.length).toBe(2)
            expect(Number.isFinite(centroid.coordinates[0])).toBe(true)
            expect(Number.isFinite(centroid.coordinates[1])).toBe(true)
        })

        it('returns coordinates for Point', () => {
            const centroid = getCentroid(point)
            expect(centroid).toEqual([1, 2])
        })

        it('returns GeoJSON Point for Point with format=geojson', () => {
            const centroid = getCentroid(point, CENTROID_FORMAT_GEOJSON)
            expect(centroid).toEqual({
                type: GEO_TYPE_POINT,
                coordinates: [1, 2],
            })
        })

        it('returns null for null geometry', () => {
            expect(getCentroid(null)).toBeNull()
        })

        it('returns null for unknown geometry type', () => {
            const unknown = {
                type: 'LineString',
                coordinates: [
                    [0, 0],
                    [1, 1],
                ],
            }
            expect(getCentroid(unknown)).toBeNull()
        })
    })
})
