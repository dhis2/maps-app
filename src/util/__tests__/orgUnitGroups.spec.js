import {
    buildOrgUnitGroupTree,
    formatOrgUnitNodeLabel,
    formatOrgUnitPathBreadcrumb,
    getOrgUnitSearchMatches,
} from '../orgUnitGroups.js'

describe('buildOrgUnitGroupTree', () => {
    it('builds a Country -> Region -> District -> Facility tree from full path values', () => {
        const tree = buildOrgUnitGroupTree([
            '/country1/region1/district1/facility1',
        ])
        expect(tree).toHaveLength(1)
        const [country] = tree
        expect(country).toMatchObject({
            key: 'country1',
            prefix: '/country1',
            ouLevel: 1,
            name: null,
        })
        expect(country.children).toHaveLength(1)
        const [region] = country.children
        expect(region).toMatchObject({
            key: 'region1',
            prefix: '/country1/region1',
            ouLevel: 2,
        })
        const [district] = region.children
        expect(district).toMatchObject({
            key: 'district1',
            prefix: '/country1/region1/district1',
            ouLevel: 3,
        })
        const [facility] = district.children
        expect(facility).toMatchObject({
            key: 'facility1',
            prefix: '/country1/region1/district1/facility1',
            ouLevel: 4,
        })
        expect(facility.children).toEqual([])
    })

    it('handles a root-level org unit with a single-segment path', () => {
        const tree = buildOrgUnitGroupTree(['/country1'])
        expect(tree).toEqual([
            {
                key: 'country1',
                prefix: '/country1',
                ouLevel: 1,
                name: null,
                children: [],
            },
        ])
    })

    it('deduplicates a shared ancestor across multiple rows into one node', () => {
        const tree = buildOrgUnitGroupTree([
            '/country1/region1/facility1',
            '/country1/region1/facility2',
            '/country1/region2/facility3',
        ])
        expect(tree).toHaveLength(1) // one country
        const [country] = tree
        expect(country.children.map((r) => r.key)).toEqual([
            'region1',
            'region2',
        ])
        const region1 = country.children[0]
        expect(region1.children.map((f) => f.key)).toEqual([
            'facility1',
            'facility2',
        ])
    })

    it("preserves the input order at every level, rather than forcing ascending - callers already order pathValues to match the column's current sort direction", () => {
        const ascending = buildOrgUnitGroupTree(['/b', '/a'])
        expect(ascending.map((n) => n.key)).toEqual(['b', 'a'])

        const descending = buildOrgUnitGroupTree([
            '/country1/region2/facility1',
            '/country1/region1/facility2',
        ])
        expect(descending.map((n) => n.key)).toEqual(['country1'])
        expect(descending[0].children.map((n) => n.key)).toEqual([
            'region2',
            'region1',
        ])
    })
})

describe('formatOrgUnitNodeLabel', () => {
    it('falls back to the raw id when the name has not resolved yet', () => {
        expect(formatOrgUnitNodeLabel({ key: 'country1' }, new Map())).toBe(
            'country1'
        )
        expect(formatOrgUnitNodeLabel({ key: 'country1' }, undefined)).toBe(
            'country1'
        )
    })

    it('uses the resolved name once present in the idToName map', () => {
        const idToName = new Map([['country1', 'Sierra Leone']])
        expect(formatOrgUnitNodeLabel({ key: 'country1' }, idToName)).toBe(
            'Sierra Leone'
        )
    })
})

describe('formatOrgUnitPathBreadcrumb', () => {
    it('joins every resolved ancestor name with " / "', () => {
        const idToName = new Map([
            ['country1', 'Sierra Leone'],
            ['region1', 'Bo'],
            ['facility1', 'Bo Hospital'],
        ])
        expect(
            formatOrgUnitPathBreadcrumb('/country1/region1/facility1', idToName)
        ).toBe('Sierra Leone / Bo / Bo Hospital')
    })

    it('falls back to the raw id per-segment for names that have not resolved yet', () => {
        const idToName = new Map([['country1', 'Sierra Leone']])
        expect(
            formatOrgUnitPathBreadcrumb('/country1/region1/facility1', idToName)
        ).toBe('Sierra Leone / region1 / facility1')
    })

    it('falls back to raw ids entirely when idToName is undefined', () => {
        expect(formatOrgUnitPathBreadcrumb('/country1/region1')).toBe(
            'country1 / region1'
        )
    })
})

describe('getOrgUnitSearchMatches', () => {
    const tree = buildOrgUnitGroupTree([
        '/country1/region1/facility1',
        '/country1/region2/facility2',
    ])
    const idToName = new Map([
        ['country1', 'Sierra Leone'],
        ['region1', 'Bo'],
        ['region2', 'Kailahun'],
        ['facility1', 'Bo Hospital'],
        ['facility2', 'Kailahun Clinic'],
    ])

    it('matches by raw id/prefix, same as the generic prefixTree.js matcher', () => {
        const { matchedKeys } = getOrgUnitSearchMatches(
            tree,
            'facility1',
            idToName
        )
        expect(matchedKeys.has('facility1')).toBe(true)
        expect(matchedKeys.has('facility2')).toBe(false)
    })

    it('also matches by resolved name, unlike the generic matcher', () => {
        const { matchedKeys, expandedAncestorKeys } = getOrgUnitSearchMatches(
            tree,
            'kailahun',
            idToName
        )
        expect(matchedKeys.has('region2')).toBe(true)
        expect(matchedKeys.has('facility2')).toBe(true)
        expect(expandedAncestorKeys.has('country1')).toBe(true)
    })

    it('a node with no resolved name yet is still matchable by id', () => {
        const { matchedKeys } = getOrgUnitSearchMatches(
            tree,
            'country1',
            new Map()
        )
        expect(matchedKeys.has('country1')).toBe(true)
    })
})
