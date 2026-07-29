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

    it('resolves an option-set-coded value to its display name, like events analytics already does server-side', () => {
        const attributes = [
            { attribute: 'genderUid', value: 'M', valueType: 'TEXT' },
        ]
        const optionSetIdByAttribute = new Map([['genderUid', 'os1']])
        const optionNamesByOptionSet = new Map([
            [
                'os1',
                new Map([
                    ['M', 'Male'],
                    ['F', 'Female'],
                ]),
            ],
        ])
        expect(
            getAttributeProperties(
                attributes,
                optionSetIdByAttribute,
                optionNamesByOptionSet
            )
        ).toEqual({ genderUid: 'Male' })
    })

    it('falls back to the raw code when no matching option name is found', () => {
        const attributes = [
            { attribute: 'genderUid', value: 'X', valueType: 'TEXT' },
        ]
        const optionSetIdByAttribute = new Map([['genderUid', 'os1']])
        const optionNamesByOptionSet = new Map([
            ['os1', new Map([['M', 'Male']])],
        ])
        expect(
            getAttributeProperties(
                attributes,
                optionSetIdByAttribute,
                optionNamesByOptionSet
            )
        ).toEqual({ genderUid: 'X' })
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
            {
                name: 'First name',
                dataKey: 'w75KJ2mc4zz',
                valueType: 'TEXT',
                optionSet: null,
            },
            {
                name: 'Last name',
                dataKey: 'zDhUuAYrxNC',
                valueType: 'TEXT',
                optionSet: null,
            },
        ])
    })

    it('returns an empty array when no instance has attributes', () => {
        expect(getAttributeHeaders([{ attributes: [] }, {}])).toEqual([])
    })

    it('stamps the resolved optionSet id onto a header when optionSetIdByAttribute has it', () => {
        const instances = [
            {
                attributes: [
                    {
                        attribute: 'genderUid',
                        displayName: 'Gender',
                        valueType: 'TEXT',
                    },
                ],
            },
        ]
        const optionSetIdByAttribute = new Map([['genderUid', 'os1']])
        expect(getAttributeHeaders(instances, optionSetIdByAttribute)).toEqual([
            {
                name: 'Gender',
                dataKey: 'genderUid',
                valueType: 'TEXT',
                optionSet: { id: 'os1' },
            },
        ])
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

    it('mints a combinedLayerKey but otherwise does nothing when config.config is absent', () => {
        const config = { layer: 'trackedEntity' }
        applyParsedConfig(config)
        expect(config).toEqual({
            layer: 'trackedEntity',
            combinedLayerKey: expect.any(String),
        })
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
                    type: 'Point',
                    w75KJ2mc4zz: 'Gabrielle',
                },
            },
        ])
    })

    it("carries the instance's own org unit id through onto properties.orgUnit", () => {
        const instances = [
            {
                id: 'tei-1',
                geometry: { type: 'Point', coordinates: [1, 2] },
                orgUnit: 'facility1',
                attributes: [],
            },
        ]

        const result = toGeoJson(instances, '#ff0000')

        expect(result[0].properties.orgUnit).toBe('facility1')
    })

    it('carries createdAt/updatedAt through onto properties', () => {
        const instances = [
            {
                id: 'tei-1',
                geometry: { type: 'Point', coordinates: [1, 2] },
                attributes: [],
                createdAt: '2024-01-01T00:00:00.000',
                updatedAt: '2024-06-15T12:30:00.000',
            },
        ]

        const result = toGeoJson(instances, '#ff0000')

        expect(result[0].properties.createdAt).toBe('2024-01-01T00:00:00.000')
        expect(result[0].properties.updatedAt).toBe('2024-06-15T12:30:00.000')
    })

    it('resolves an option-set-coded attribute value to its display name when the resolution maps are given', () => {
        const instances = [
            {
                id: 'tei-1',
                geometry: { type: 'Point', coordinates: [1, 2] },
                attributes: [
                    { attribute: 'genderUid', value: 'M', valueType: 'TEXT' },
                ],
            },
        ]
        const optionSetIdByAttribute = new Map([['genderUid', 'os1']])
        const optionNamesByOptionSet = new Map([
            ['os1', new Map([['M', 'Male']])],
        ])

        const result = toGeoJson(instances, '#ff0000', {
            optionSetIdByAttribute,
            optionNamesByOptionSet,
        })

        expect(result[0].properties.genderUid).toBe('Male')
    })
})
