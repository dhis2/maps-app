import {
    formatOrgUnitOwnName,
    formatOrgUnitPathBreadcrumb,
} from '../orgUnitGroups.js'

describe('formatOrgUnitOwnName', () => {
    it('falls back to the raw id when the name has not resolved yet', () => {
        expect(formatOrgUnitOwnName('/country1/region1', new Map())).toBe(
            'region1'
        )
        expect(formatOrgUnitOwnName('/country1/region1', undefined)).toBe(
            'region1'
        )
    })

    it('uses the resolved name of the last path segment', () => {
        const idToName = new Map([
            ['country1', 'Sierra Leone'],
            ['region1', 'Bo'],
        ])
        expect(formatOrgUnitOwnName('/country1/region1', idToName)).toBe('Bo')
    })

    it('accepts a bare id as well as a path', () => {
        const idToName = new Map([['region1', 'Bo']])
        expect(formatOrgUnitOwnName('region1', idToName)).toBe('Bo')
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
