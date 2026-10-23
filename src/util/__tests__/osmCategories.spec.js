import {
    getOsmMetadata,
    getStageDataElements,
    OSM_DATA_ELEMENTS as DE,
} from '../../components/osmImport/osmMetadata.js'
import {
    findTag,
    getOsmCategories,
    getOsmCategory,
    getOverpassFilters,
    getSubcategoryIds,
    getTagForValue,
    OSM_GEOMETRY_LINE,
    OSM_GEOMETRY_POINT,
} from '../osmCategories.js'

describe('osmCategories', () => {
    it('makes one category per use, with a program each', () => {
        const categories = getOsmCategories()
        expect(categories.map(({ id }) => id)).toEqual([
            'health_facilities',
            'education',
            'water_sanitation',
            'humanitarian',
            'public_services',
            'cemeteries',
            'settlements',
            'transport_hubs',
            'roads',
            'waterways',
        ])
        expect(new Set(categories.map((c) => c.program.id)).size).toBe(10)
    })

    it('makes lines of the uses that only query ways', () => {
        const lines = getOsmCategories()
            .filter((c) => c.geometry === OSM_GEOMETRY_LINE)
            .map(({ id }) => id)
        expect(lines).toEqual(['roads', 'waterways'])
        expect(getOsmCategory('settlements').geometry).toBe(OSM_GEOMETRY_POINT)
    })

    it('has road subcategories by class', () => {
        const roads = getOsmCategory('roads')
        expect(getSubcategoryIds(roads)).toEqual([
            'motorways',
            'trunk',
            'primary',
            'secondary',
            'tertiary',
            'minor_roads',
            'tracks_and_service',
            'paths',
        ])
        expect(roads.subcategories[2]).toMatchObject({
            name: 'Primary roads',
            values: ['primary', 'primary_link'],
        })
    })

    it('builds one Overpass filter per element type and key', () => {
        const health = getOsmCategory('health_facilities')
        expect(getOverpassFilters(health, ['pharmacies'])).toEqual([
            'nwr["amenity"~"^(pharmacy)$"]',
            'nwr["healthcare"~"^(pharmacy)$"]',
        ])
        expect(getOverpassFilters(health, getSubcategoryIds(health))).toContain(
            'nwr["emergency"~"^(ambulance_station)$"]'
        )
        expect(
            getOverpassFilters(getOsmCategory('settlements'), ['villages'])
        ).toEqual(['node["place"~"^(village)$"]'])
    })

    it('finds the tag that puts an element in a subcategory', () => {
        const health = getOsmCategory('health_facilities')
        const tags = { amenity: 'pharmacy', healthcare: 'pharmacy' }
        expect(findTag(health, tags)).toMatchObject({
            key: 'amenity',
            value: 'pharmacy',
            subcategory: 'pharmacies',
        })
        expect(findTag(health, tags, ['hospitals'])).toBeUndefined()
        expect(getTagForValue(health, 'centre')).toMatchObject({
            key: 'healthcare',
            subcategory: 'clinics',
        })
    })

    it('builds the program stage of a category', () => {
        const roads = getOsmCategory('roads')
        const education = getOsmCategory('education')

        expect(getStageDataElements(roads)).toEqual(
            expect.arrayContaining([
                DE.roadClass,
                DE.roadSurface,
                DE.length,
                DE.lineGeometry,
                DE.tag,
                DE.subcategory,
            ])
        )
        expect(getStageDataElements(education)).toContain(DE.type)
        expect(getStageDataElements(education)).not.toContain(DE.length)

        const { programs, programStages } = getOsmMetadata(education)
        expect(programs[0]).toMatchObject({
            code: 'OSM_EDUCATION',
            programStages: [{ id: education.program.programStage }],
        })
        expect(programStages[0].programStageDataElements).toHaveLength(
            getStageDataElements(education).length
        )
    })
})
