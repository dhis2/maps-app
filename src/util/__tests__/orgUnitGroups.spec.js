import {
    formatOrgUnitNodeLabel,
    formatOrgUnitPathBreadcrumb,
} from '../orgUnitGroups.js'

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
