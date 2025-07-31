import { createGeoJsonBlob } from '../dataDownload.js'

// Since we're not in a browser environment we unfortunately have to mock FileSaver and Blob
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

jest.mock('../earthEngine.js', () => ({ hasClasses: jest.fn() }))

window.Blob = function (content, options) {
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
})
