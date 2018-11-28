import FileSaver from 'file-saver';
import {
    createGeoJsonBlob,
    downloadGeoJson,
    getBounds,
    addStyleDataItem,
    createEventFeature,
    buildEventCoordinateGetter,
    createEventFeatures,
} from '../geojson';

// Since we're not in a browser environment we unfortunately have to mock FileSaver and Blob
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
global.Blob = function(content, options) {
    return { content, options };
};

const sampleData = [
    {
        type: 'Feature',
        id: '1234',
        geometry: {
            type: 'MultiPolygon',
            coordinates: [[[0, 0], [1, 1], [2, 3], [0, 3]]],
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
            coordinates: [[[0, 0], [1, 1], [2, 3], [0, 3]]],
        },
        attributes: {
            testAttribute: 'someValue',
            attr2: 'someOtherValue',
        },
    },
];

const geoJSONString = JSON.stringify({
    type: 'FeatureCollection',
    features: sampleData,
});

describe('geojson utils', () => {
    describe('createGeoJsonBlob and downloadGeoJson', () => {
        let blob;
        it('should generate a geoJSON string and set content-type correctly', () => {
            blob = createGeoJsonBlob(sampleData);
            expect(blob).toMatchObject({
                content: [geoJSONString],
                options: {
                    type: 'application/json;charset=utf-8',
                },
            });
        });
        it('should escape name whitespace and call saveAs', () => {
            downloadGeoJson({
                name: 'Testing geo-json    download',
                data: sampleData,
            });
            expect(FileSaver.saveAs).toHaveBeenCalledWith(
                blob,
                'Testing_geo-json_download.geojson'
            );
        });
    });

    describe('createEventFeature', () => {
        const headers = [{ name: 'C1' }, { name: 'C2' }];
        const dummyID = 'IAmAnID';
        const dummyEventRow = ['What is the question?', 42];
        const dummyCoordinates = [0, 0];
        const dummyGetCoordinates = jest.fn(x => dummyCoordinates.map(String)); // Stringify
        it('Should create a single feature from a single event with no Names passed', () => {
            expect(
                createEventFeature(
                    headers,
                    {},
                    dummyEventRow,
                    dummyID,
                    dummyGetCoordinates
                )
            ).toEqual({
                type: 'Feature',
                id: dummyID,
                properties: {
                    [headers[0].name]: dummyEventRow[0],
                    [headers[1].name]: dummyEventRow[1],
                },
                geometry: {
                    type: 'Point',
                    coordinates: dummyCoordinates,
                },
            });
        });

        it('Should convert property names when they match passed names', () => {
            const names = {
                [headers[0].name]: 'Column #1',
            };
            expect(
                createEventFeature(
                    headers,
                    names,
                    dummyEventRow,
                    dummyID,
                    dummyGetCoordinates
                )
            ).toEqual({
                type: 'Feature',
                id: dummyID,
                properties: {
                    [names[headers[0].name]]: dummyEventRow[0],
                    [headers[1].name]: dummyEventRow[1],
                },
                geometry: {
                    type: 'Point',
                    coordinates: dummyCoordinates,
                },
            });
        });
    });

    describe('buildEventCoordinateGetter', () => {
        const headers = [
            { name: 'id' },
            { name: 'latitude' },
            { name: 'myStringCoordinates' },
            { name: 'longitude' },
            { name: 'SomeField' },
            { name: 'myArrayCoordinates' },
            { name: 'SomeOtherField' },
        ];
        const coords = [12.9, 5.4];
        const stringCoords = [9, 14.3];
        const arrayCoords = [21.1, 42.2];
        const dummyEvent = [
            'MyID',
            coords[1],
            JSON.stringify(stringCoords),
            coords[0],
            54321,
            arrayCoords,
            1234,
        ];
        it('Should default to fetching longitude and latitude columns', () => {
            const getter = buildEventCoordinateGetter(headers);
            expect(getter(dummyEvent)).toEqual(coords);
        });

        it('Should parse a string coordinate', () => {
            const getter = buildEventCoordinateGetter(
                headers,
                'myStringCoordinates'
            );
            expect(getter(dummyEvent)).toEqual(stringCoords);
        });

        it('Should parse a coordinate array', () => {
            const getter = buildEventCoordinateGetter(
                headers,
                'myArrayCoordinates'
            );
            expect(getter(dummyEvent)).toEqual(arrayCoords);
        });

        it('Should return an empty array on integer value', () => {
            const getter = buildEventCoordinateGetter(headers, 'SomeField');
            expect(getter(dummyEvent)).toEqual([]);
        });

        it('Should return an empty array on invalid string value', () => {
            const getter = buildEventCoordinateGetter(headers, 'id');
            expect(getter(dummyEvent)).toEqual([]);
        });
    });

    describe('createEventFeatures', () => {
        const headers = [
            { name: 'SomeField', column: 'SomeField Column' },
            { name: 'psi', column: 'psi Column' },
            { name: 'TheRealID', column: 'TheRealID Column' },
            { name: 'latitude', column: 'latitude Column' },
            { name: 'longitude', column: 'longitude Column' },
            { name: 'SomeOtherField', column: 'SomeOtherField Column' },
        ];
        const metaData = {
            items: headers.reduce(
                (out, header) => ({
                    ...out,
                    [header.name]: header.name + 'META',
                }),
                {}
            ),
        };

        const rows = [
            ['ping', 'psi0', 'id0', 21.1, 42.2, 'pong'],
            ['foo', 'psi1', 'id1', 21.2, 42.3, 'bar'],
            ['bill', 'psi2', 'id2', 21.3, 42.4, 'gates'],
            ['paul', 'psi3', 'id3', 21.4, 42.5, 'allen'],
        ];
        const response = {
            headers,
            rows,
            metaData,
        };

        const defaultNames = headers.reduce(
            (names, header) => ({
                ...names,
                [header.name]: header.column,
            }),
            {}
        );

        it('Should create an array of features with the proper field mappings', () => {
            const out = createEventFeatures(response);
            expect(out.names).toEqual(defaultNames);
            expect(out.data).toEqual(
                rows.map(row => ({
                    type: 'Feature',
                    id: row[1],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [header.column]: row[i],
                        }),
                        {}
                    ),
                    geometry: {
                        type: 'Point',
                        coordinates: [row[4], row[3]],
                    },
                }))
            );
        });

        it('Should use alternative ID column', () => {
            const out = createEventFeatures(response, { idCol: 'TheRealID' });
            expect(out.names).toEqual(defaultNames);
            expect(out.data).toEqual(
                rows.map(row => ({
                    type: 'Feature',
                    id: row[2],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [header.column]: row[i],
                        }),
                        {}
                    ),
                    geometry: {
                        type: 'Point',
                        coordinates: [row[4], row[3]],
                    },
                }))
            );
        });

        it('Should use ID output scheme', () => {
            const out = createEventFeatures(response, {
                outputIdScheme: 'ID',
            });
            // expect(out.names).toEqual({});
            expect(out.data).toEqual(
                rows.map(row => ({
                    type: 'Feature',
                    id: row[1],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [header.name]: row[i],
                        }),
                        {}
                    ),
                    geometry: {
                        type: 'Point',
                        coordinates: [row[4], row[3]],
                    },
                }))
            );
        });

        it('Should use custom name mappings', () => {
            const columnNames = headers.reduce(
                (out, header) => ({
                    ...out,
                    [header.name]: `${header.name} CUSTOM`,
                }),
                {}
            );
            const out = createEventFeatures(response, {
                columnNames,
            });
            expect(out.names).toEqual(columnNames);
            expect(out.data).toEqual(
                rows.map(row => ({
                    type: 'Feature',
                    id: row[1],
                    properties: headers.reduce(
                        (out, header, i) => ({
                            ...out,
                            [`${header.name} CUSTOM`]: row[i],
                        }),
                        {}
                    ),
                    geometry: {
                        type: 'Point',
                        coordinates: [row[4], row[3]],
                    },
                }))
            );
        });
    });

    describe('addStyleDataItem', () => {
        const dummyDataItems = ['test', 'copy', 42]; // Types shouldn't be coerced
        it('Should return a new array with identical items if no styleDataItem passed', () => {
            const result = addStyleDataItem(dummyDataItems);
            expect(result).not.toBe(dummyDataItems); // New array, not ===
            expect(result).toEqual(dummyDataItems);
        });
        it('Should append a properly-structured data item', () => {
            const newItem = {
                id: 'id',
                name: 'name',
            };
            const result = addStyleDataItem(dummyDataItems, newItem);
            expect(result).toHaveLength(dummyDataItems.length + 1);
            expect(result.slice(0, -1)).toEqual(dummyDataItems);
            expect(result[result.length - 1]).toEqual({
                dimension: newItem.id,
                name: newItem.name,
            });
        });
    });

    describe('getBounds', () => {
        it('Should return null when passed null', () => {
            expect(getBounds()).toBeNull();
        });
        it('Should correctly parse a simple bounding box', () => {
            const bbox = getBounds('[0][1][2][3]');
            expect(bbox).toEqual([['1', '0'], ['3', '2']]);
        });
    });
});
