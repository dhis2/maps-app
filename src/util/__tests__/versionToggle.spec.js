import { serverSupportsTracker41Api } from '../versionToggle.js'

describe('serverSupportsTracker41Api', () => {
    it.each([
        [{ minor: 40 }, false],
        [{ minor: 41 }, true],
        [{ minor: 43 }, true],
    ])('%p returns %p', (serverVersion, expected) => {
        expect(serverSupportsTracker41Api(serverVersion)).toBe(expected)
    })
})
