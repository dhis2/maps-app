import {
    serverSupportsGeometrySource,
    serverSupportsOrgUnitCoordinateField,
} from '../versionToggle.js'

describe('serverSupportsGeometrySource', () => {
    it('returns false below 2.44', () => {
        expect(serverSupportsGeometrySource({ minor: 43 })).toBe(false)
    })

    it('returns true at 2.44', () => {
        expect(serverSupportsGeometrySource({ minor: 44 })).toBe(true)
    })

    it('returns true above 2.44', () => {
        expect(serverSupportsGeometrySource({ minor: 45 })).toBe(true)
    })

    it('returns false when serverVersion is undefined', () => {
        expect(serverSupportsGeometrySource(undefined)).toBe(false)
    })
})

describe('serverSupportsOrgUnitCoordinateField', () => {
    it('returns false on 2.40 below patch 8', () => {
        expect(
            serverSupportsOrgUnitCoordinateField({ minor: 40, patch: 7 })
        ).toBe(false)
    })

    it('returns true on 2.40 from patch 8', () => {
        expect(
            serverSupportsOrgUnitCoordinateField({ minor: 40, patch: 8 })
        ).toBe(true)
    })

    it('returns false on 2.41 below patch 4', () => {
        expect(
            serverSupportsOrgUnitCoordinateField({ minor: 41, patch: 3 })
        ).toBe(false)
    })

    it('returns true on 2.41 from patch 4', () => {
        expect(
            serverSupportsOrgUnitCoordinateField({ minor: 41, patch: 4 })
        ).toBe(true)
    })

    it('returns true on 2.42 and above regardless of patch', () => {
        expect(
            serverSupportsOrgUnitCoordinateField({ minor: 42, patch: 0 })
        ).toBe(true)
        expect(
            serverSupportsOrgUnitCoordinateField({ minor: 45, patch: 0 })
        ).toBe(true)
    })

    it('returns false when serverVersion is undefined', () => {
        expect(serverSupportsOrgUnitCoordinateField(undefined)).toBe(false)
    })
})
