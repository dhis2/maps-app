import { getTrackerMaxLimit } from '../trackedEntity.js'

describe('getTrackerMaxLimit', () => {
    const settings = {
        KeyTrackedEntityInstanceMaxLimit: 40000,
        KeyTrackedEntityMaxLimit: 50000,
    }

    it.each([
        { version: '2.40', serverVersion: { minor: 40 }, expected: 40000 },
        { version: '2.41', serverVersion: { minor: 41 }, expected: 50000 },
    ])('reads the $version setting', ({ serverVersion, expected }) => {
        expect(getTrackerMaxLimit(settings, serverVersion)).toBe(expected)
    })

    it('reads a setting stored as a string', () => {
        expect(
            getTrackerMaxLimit(
                { KeyTrackedEntityMaxLimit: '50000' },
                { minor: 43 }
            )
        ).toBe(50000)
    })

    // 2.41 has both settings, but its tracker API applies the new one
    it('ignores the deprecated setting on 2.41', () => {
        expect(
            getTrackerMaxLimit(
                {
                    KeyTrackedEntityInstanceMaxLimit: 10000,
                    KeyTrackedEntityMaxLimit: 50000,
                },
                { minor: 41 }
            )
        ).toBe(50000)
    })

    it.each([[undefined], [''], [0], ['abc']])(
        'returns null for the setting %p',
        (value) => {
            expect(
                getTrackerMaxLimit(
                    { KeyTrackedEntityMaxLimit: value },
                    { minor: 43 }
                )
            ).toBeNull()
        }
    )
})
