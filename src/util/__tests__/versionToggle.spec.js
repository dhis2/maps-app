import {
    serverSupportsTrackedEntityAnalytics,
    serverSupportsTrackedEntityAnalyticsIdColumn,
    serverSupportsTracker41Api,
    serverSupportsTrackerEnrollmentStatus,
} from '../versionToggle.js'

describe('serverSupportsTracker41Api', () => {
    it.each([
        [{ minor: 40 }, false],
        [{ minor: 41 }, true],
        [{ minor: 43 }, true],
    ])('%p returns %p', (serverVersion, expected) => {
        expect(serverSupportsTracker41Api(serverVersion)).toBe(expected)
    })
})

describe('serverSupportsTrackerEnrollmentStatus', () => {
    it.each([
        [{ minor: 41 }, false],
        [{ minor: 42 }, true],
        [{ minor: 43 }, true],
    ])('%p returns %p', (serverVersion, expected) => {
        expect(serverSupportsTrackerEnrollmentStatus(serverVersion)).toBe(
            expected
        )
    })
})

describe('serverSupportsTrackedEntityAnalytics', () => {
    it.each([
        [{ minor: 40 }, false],
        [{ minor: 41 }, true],
    ])('%p returns %p', (serverVersion, expected) => {
        expect(serverSupportsTrackedEntityAnalytics(serverVersion)).toBe(
            expected
        )
    })
})

describe('serverSupportsTrackedEntityAnalyticsIdColumn', () => {
    it.each([
        [{ minor: 41 }, false],
        [{ minor: 42 }, true],
    ])('%p returns %p', (serverVersion, expected) => {
        expect(
            serverSupportsTrackedEntityAnalyticsIdColumn(serverVersion)
        ).toBe(expected)
    })
})
