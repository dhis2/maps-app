import {
    getUnmatchedFeatureCount,
    hasCombinedRollup,
} from '../combinedJoinMatch.js'

const referenceFeature = (id, path) => ({
    properties: { id, name: id, orgUnitPath: path, level: 2 },
})

const orgUnitFeature = (path) => ({
    properties: { orgUnitPath: path },
})

const pointFeature = (coordinates) => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates },
})

const polygonReferenceFeature = (id, coordinates) => ({
    type: 'Feature',
    properties: { id, name: id, level: 2 },
    geometry: { type: 'Polygon', coordinates: [coordinates] },
})

describe('hasCombinedRollup', () => {
    test('is false when the reference layer has no org units at all', () => {
        expect(
            hasCombinedRollup(
                { data: [orgUnitFeature('/country1/ou1')] },
                { data: [] },
                'orgUnit'
            )
        ).toBe(false)
    })

    test('org unit join: is false when every reference org unit matches at most one feature', () => {
        const referenceLayer = {
            data: [
                referenceFeature('ref1', '/country1/ref1'),
                referenceFeature('ref2', '/country1/ref2'),
            ],
        }
        const layer = {
            data: [
                orgUnitFeature('/country1/ref1'),
                orgUnitFeature('/country1/ref2'),
            ],
        }
        expect(hasCombinedRollup(layer, referenceLayer, 'orgUnit')).toBe(false)
    })

    test('org unit join: is true when a reference org unit matches more than one feature (a rollup)', () => {
        const referenceLayer = {
            data: [referenceFeature('ref1', '/country1/ref1')],
        }
        const layer = {
            data: [
                orgUnitFeature('/country1/ref1/child1'),
                orgUnitFeature('/country1/ref1/child2'),
            ],
        }
        expect(hasCombinedRollup(layer, referenceLayer, 'orgUnit')).toBe(true)
    })

    test('spatial join: is true when a reference polygon contains more than one point feature', () => {
        const referenceLayer = {
            data: [
                polygonReferenceFeature('ref1', [
                    [0, 0],
                    [2, 0],
                    [2, 2],
                    [0, 2],
                    [0, 0],
                ]),
            ],
        }
        const layer = {
            data: [pointFeature([1, 1]), pointFeature([1.5, 1.5])],
        }
        expect(hasCombinedRollup(layer, referenceLayer, 'spatial')).toBe(true)
    })

    test('spatial join: is false when each reference polygon contains at most one point feature', () => {
        const referenceLayer = {
            data: [
                polygonReferenceFeature('ref1', [
                    [0, 0],
                    [2, 0],
                    [2, 2],
                    [0, 2],
                    [0, 0],
                ]),
                polygonReferenceFeature('ref2', [
                    [10, 10],
                    [12, 10],
                    [12, 12],
                    [10, 12],
                    [10, 10],
                ]),
            ],
        }
        const layer = {
            data: [pointFeature([1, 1]), pointFeature([11, 11])],
        }
        expect(hasCombinedRollup(layer, referenceLayer, 'spatial')).toBe(false)
    })
})

describe('getUnmatchedFeatureCount', () => {
    test('is 0 when the reference layer has no org units at all', () => {
        expect(
            getUnmatchedFeatureCount(
                { data: [orgUnitFeature('/country1/ou1')] },
                { data: [] },
                'orgUnit'
            )
        ).toBe(0)
    })

    test('org unit join: is 0 when every feature matches a reference org unit', () => {
        const referenceLayer = {
            data: [referenceFeature('ref1', '/country1/ref1')],
        }
        const layer = {
            data: [orgUnitFeature('/country1/ref1/child1')],
        }
        expect(getUnmatchedFeatureCount(layer, referenceLayer, 'orgUnit')).toBe(
            0
        )
    })

    test('org unit join: counts features with no matching reference ancestor (wrong branch or higher level)', () => {
        const referenceLayer = {
            data: [referenceFeature('ref1', '/country1/ref1')],
        }
        const layer = {
            data: [
                orgUnitFeature('/country1/ref1/child1'),
                orgUnitFeature('/country2/other/child2'),
                orgUnitFeature('/country1'),
            ],
        }
        expect(getUnmatchedFeatureCount(layer, referenceLayer, 'orgUnit')).toBe(
            2
        )
    })

    test('spatial join: counts points that fall outside every reference polygon', () => {
        const referenceLayer = {
            data: [
                polygonReferenceFeature('ref1', [
                    [0, 0],
                    [2, 0],
                    [2, 2],
                    [0, 2],
                    [0, 0],
                ]),
            ],
        }
        const layer = {
            data: [pointFeature([1, 1]), pointFeature([10, 10])],
        }
        expect(getUnmatchedFeatureCount(layer, referenceLayer, 'spatial')).toBe(
            1
        )
    })
})

describe('layer.dataFilters applied before hasCombinedRollup/getUnmatchedFeatureCount', () => {
    const referenceLayer = {
        data: [referenceFeature('ref1', '/country1/ref1')],
    }

    test('hasCombinedRollup no longer sees a rollup once dataFilters excludes the second feature', () => {
        const layer = {
            data: [
                {
                    properties: {
                        orgUnitPath: '/country1/ref1/child1',
                        status: 'open',
                    },
                },
                {
                    properties: {
                        orgUnitPath: '/country1/ref1/child2',
                        status: 'closed',
                    },
                },
            ],
            dataFilters: { status: 'open' },
        }
        expect(hasCombinedRollup(layer, referenceLayer, 'orgUnit')).toBe(false)
    })

    test('getUnmatchedFeatureCount excludes a feature already removed by dataFilters, rather than counting it as unmatched', () => {
        const layer = {
            data: [
                {
                    properties: {
                        orgUnitPath: '/country1/ref1/child1',
                        status: 'open',
                    },
                },
                {
                    properties: {
                        orgUnitPath: '/country2/other',
                        status: 'closed',
                    },
                },
            ],
            dataFilters: { status: 'open' },
        }
        expect(getUnmatchedFeatureCount(layer, referenceLayer, 'orgUnit')).toBe(
            0
        )
    })
})
