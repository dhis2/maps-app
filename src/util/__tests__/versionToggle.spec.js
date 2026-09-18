import { serverSupportsGeometrySource } from '../versionToggle.js'

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
