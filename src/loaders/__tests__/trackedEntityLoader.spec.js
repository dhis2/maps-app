import {
    getAttributeHeaders,
    getAttributeProperties,
    applyParsedConfig,
    toGeoJson,
} from '../trackedEntityLoader.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

describe('getAttributeProperties', () => {
    it('maps each attribute uid to its value', () => {
        const attributes = [
            { attribute: 'w75KJ2mc4zz', value: 'Gabrielle' },
            { attribute: 'zDhUuAYrxNC', value: 'Schmidt' },
        ]
        expect(getAttributeProperties(attributes)).toEqual({
            w75KJ2mc4zz: 'Gabrielle',
            zDhUuAYrxNC: 'Schmidt',
        })
    })

    it('returns an empty object when there are no attributes', () => {
        expect(getAttributeProperties(undefined)).toEqual({})
        expect(getAttributeProperties([])).toEqual({})
    })

    it('coerces a numeric-valueType attribute value to a real number', () => {
        const attributes = [
            { attribute: 'ageUid', value: '34', valueType: 'INTEGER' },
            { attribute: 'nameUid', value: 'Gabrielle', valueType: 'TEXT' },
        ]
        expect(getAttributeProperties(attributes)).toEqual({
            ageUid: 34,
            nameUid: 'Gabrielle',
        })
    })

    it('leaves a numeric-valueType value with no data as undefined, not NaN', () => {
        const attributes = [
            { attribute: 'ageUid', value: '', valueType: 'INTEGER' },
        ]
        expect(getAttributeProperties(attributes).ageUid).toBeUndefined()
    })
})

describe('getAttributeHeaders', () => {
    it('returns one header per unique attribute uid seen across instances', () => {
        const instances = [
            {
                attributes: [
                    {
                        attribute: 'w75KJ2mc4zz',
                        displayName: 'First name',
                        valueType: 'TEXT',
                    },
                ],
            },
            {
                attributes: [
                    {
                        attribute: 'w75KJ2mc4zz',
                        displayName: 'First name',
                        valueType: 'TEXT',
                    },
                    {
                        attribute: 'zDhUuAYrxNC',
                        displayName: 'Last name',
                        valueType: 'TEXT',
                    },
                ],
            },
        ]
        expect(getAttributeHeaders(instances)).toEqual([
            { name: 'First name', dataKey: 'w75KJ2mc4zz', valueType: 'TEXT' },
            { name: 'Last name', dataKey: 'zDhUuAYrxNC', valueType: 'TEXT' },
        ])
    })

    it('returns an empty array when no instance has attributes', () => {
        expect(getAttributeHeaders([{ attributes: [] }, {}])).toEqual([])
    })
})

describe('applyParsedConfig', () => {
    it('extracts periodType when relationships is null', () => {
        const config = {
            config: JSON.stringify({
                relationships: null,
                periodType: 'program',
            }),
        }
        applyParsedConfig(config)
        expect(config.periodType).toBe('program')
        expect(config.relationshipType).toBeUndefined()
        expect(config.config).toBeUndefined()
    })

    it('extracts both periodType and relationship fields when relationships is set', () => {
        const config = {
            config: JSON.stringify({
                relationships: {
                    type: 'rel-type-id',
                    pointColor: '#ff0000',
                    pointRadius: 5,
                    lineColor: '#0000ff',
                    relationshipOutsideProgram: true,
                },
                periodType: 'program',
            }),
        }
        applyParsedConfig(config)
        expect(config.periodType).toBe('program')
        expect(config.relationshipType).toBe('rel-type-id')
        expect(config.relatedPointColor).toBe('#ff0000')
        expect(config.relatedPointRadius).toBe(5)
        expect(config.relationshipLineColor).toBe('#0000ff')
        expect(config.relationshipOutsideProgram).toBe(true)
        expect(config.config).toBeUndefined()
    })

    it('does nothing when config.config is absent', () => {
        const config = { layer: 'trackedEntity' }
        applyParsedConfig(config)
        expect(config).toEqual({ layer: 'trackedEntity' })
    })

    it('does not throw and leaves config intact on malformed JSON', () => {
        const config = { config: 'not-valid-json' }
        expect(() => applyParsedConfig(config)).not.toThrow()
        expect(config.periodType).toBeUndefined()
        expect(config.config).toBeUndefined()
    })
})

describe('toGeoJson', () => {
    it('stamps the given color onto every instance, alongside its id and attributes', () => {
        const instances = [
            {
                id: 'tei-1',
                geometry: { type: 'Point', coordinates: [1, 2] },
                attributes: [{ attribute: 'w75KJ2mc4zz', value: 'Gabrielle' }],
            },
        ]

        const result = toGeoJson(instances, '#ff0000')

        expect(result).toEqual([
            {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [1, 2] },
                properties: {
                    id: 'tei-1',
                    color: '#ff0000',
                    w75KJ2mc4zz: 'Gabrielle',
                },
            },
        ])
    })
})
