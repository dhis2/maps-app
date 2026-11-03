import {
    serverSupportsTracker41Api,
    serverSupportsTrackedEntityAnalytics,
    serverSupportsTrackedEntityAnalyticsIdColumn,
} from '../versionToggle.js'

describe('serverSupportsTracker41Api', () => {
    it('returns false on 2.40', () => {
        expect(serverSupportsTracker41Api({ minor: 40 })).toBe(false)
    })

    it('returns true at 2.41', () => {
        expect(serverSupportsTracker41Api({ minor: 41 })).toBe(true)
    })

    it('returns true above 2.41', () => {
        expect(serverSupportsTracker41Api({ minor: 43 })).toBe(true)
    })

    it('returns false when serverVersion is undefined', () => {
        expect(serverSupportsTracker41Api(undefined)).toBe(false)
    })
})

describe('serverSupportsTrackedEntityAnalytics', () => {
    it('returns false on 2.40', () => {
        expect(serverSupportsTrackedEntityAnalytics({ minor: 40 })).toBe(false)
    })

    it('returns true at 2.41', () => {
        expect(serverSupportsTrackedEntityAnalytics({ minor: 41 })).toBe(true)
    })

    it('returns true above 2.41', () => {
        expect(serverSupportsTrackedEntityAnalytics({ minor: 43 })).toBe(true)
    })

    it('returns false when serverVersion is undefined', () => {
        expect(serverSupportsTrackedEntityAnalytics(undefined)).toBe(false)
    })
})

describe('serverSupportsTrackedEntityAnalyticsIdColumn', () => {
    it('returns false on 2.41', () => {
        expect(
            serverSupportsTrackedEntityAnalyticsIdColumn({ minor: 41 })
        ).toBe(false)
    })

    it('returns true from 2.42', () => {
        expect(
            serverSupportsTrackedEntityAnalyticsIdColumn({ minor: 42 })
        ).toBe(true)
    })

    it('returns false when serverVersion is undefined', () => {
        expect(serverSupportsTrackedEntityAnalyticsIdColumn(undefined)).toBe(
            false
        )
    })
})
