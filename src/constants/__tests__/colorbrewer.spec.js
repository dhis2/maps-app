import colorbrewer from '../colorbrewer.js'

const baseNames = Object.keys(colorbrewer).filter(
    (name) => !name.endsWith('_reverse')
)

describe('colorbrewer', () => {
    test('every base scale has a corresponding _reverse entry', () => {
        for (const name of baseNames) {
            expect(colorbrewer[`${name}_reverse`]).toBeDefined()
        }
    })

    test('_reverse entries are the mirror of their base scale', () => {
        for (const name of baseNames) {
            const base = colorbrewer[name]
            const reversed = colorbrewer[`${name}_reverse`]
            for (const bins of Object.keys(base)) {
                expect(reversed[bins]).toEqual([...base[bins]].reverse())
            }
        }
    })

    test('_reverse entries do not mutate the base scale arrays', () => {
        for (const name of baseNames) {
            const base = colorbrewer[name]
            const reversed = colorbrewer[`${name}_reverse`]
            for (const bins of Object.keys(base)) {
                expect(reversed[bins]).not.toBe(base[bins])
            }
        }
    })
})
