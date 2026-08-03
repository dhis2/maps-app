import {
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_NONE,
    DIGIT_GROUP_SEPARATOR_SPACE,
} from '../../constants/settings.js'
import earthEngineLoader, { createLegend } from '../earthEngineLoader.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

describe('earthEngineLoader', () => {
    // No org units, so the loader skips the engine query entirely.
    const baseArgs = {
        engine: { query: jest.fn() },
        keyAnalysisDisplayProperty: 'name',
        keyAnalysisDigitGroupSeparator: DIGIT_GROUP_SEPARATOR_COMMA,
        userId: 'userId',
    }

    describe('backward compatibility for layers saved before v100.6.0', () => {
        // Pre-v100.6.0 favorites stored a dynamic `filter` array (and no
        // `image`), which the loader converts into a `period`.
        const configWithFilter = (filter) => ({
            ...baseArgs,
            config: {
                rows: [],
                config: JSON.stringify({
                    id: 'fakeDatasetId',
                    filter,
                }),
            },
        })

        it('loads a filter-only layer config without throwing', async () => {
            // Regression: `filter` was referenced out of scope in this branch,
            // throwing a ReferenceError outside the try/catch so the loader
            // promise rejected and the layer never loaded (permanent spinner).
            const result = await earthEngineLoader(
                configWithFilter([
                    {
                        id: '2020',
                        name: '2020',
                        year: 2020,
                        arguments: ['year', '2020'],
                    },
                ])
            )

            expect(result.isLoaded).toBe(true)
            expect(result.period).toEqual({
                id: '2020',
                name: '2020',
                year: 2020,
            })
        })

        it('derives the period id from the filter arguments when no id is set', async () => {
            const result = await earthEngineLoader(
                configWithFilter([{ arguments: ['year', '2015'] }])
            )

            expect(result.isLoaded).toBe(true)
            expect(result.period.id).toBe('2015')
        })
    })

    describe('backward compatibility for layers with periods saved before 2.36', () => {
        // Pre-2.36 favorites stored both an `image` and a dynamic `filter`,
        // from which the loader reconstructs the `period`.
        it('builds the period from the image and filter', async () => {
            const result = await earthEngineLoader({
                ...baseArgs,
                config: {
                    rows: [],
                    config: JSON.stringify({
                        id: 'fakeDatasetId',
                        image: 'WorldPop',
                        filter: [{ arguments: ['system:index', '20200101'] }],
                    }),
                },
            })

            expect(result.isLoaded).toBe(true)
            expect(result.period).toEqual({
                id: '20200101',
                name: 'WorldPop',
                year: 2020,
            })
        })
    })
})

describe('createLegend', () => {
    describe('when ranges are provided', () => {
        it('maps palette colors to ranges and ignores separator', () => {
            const style = {
                min: 0,
                max: 100,
                palette: ['red', 'blue'],
                ranges: [
                    { startValue: 0, endValue: 50, name: 'Low' },
                    { startValue: 50, endValue: 100, name: 'High' },
                ],
            }
            const items = createLegend(
                style,
                false,
                DIGIT_GROUP_SEPARATOR_COMMA
            )
            expect(items).toHaveLength(2)
            const low = items.find((i) => i.name === 'Low')
            const high = items.find((i) => i.name === 'High')
            expect(low.color).toBe('red')
            expect(high.color).toBe('blue')
        })
    })

    describe('when ranges are not provided', () => {
        const style = { min: 1000, max: 3000, palette: ['#a', '#b'] }

        it('formats item names with COMMA separator', () => {
            const items = createLegend(
                style,
                false,
                DIGIT_GROUP_SEPARATOR_COMMA
            )
            const names = items.map((i) => i.name)
            expect(names).toContain('1,000 – 3,000')
            // "> max" item has no pre-formatted name; boundary is in item.from
            const aboveMax = items.find(
                (i) =>
                    i.to === undefined &&
                    i.from !== undefined &&
                    i.from !== -Infinity
            )
            expect(aboveMax).toBeDefined()
            expect(aboveMax.from).toBe(3000)
        })

        it('formats item names with SPACE separator', () => {
            const items = createLegend(
                style,
                false,
                DIGIT_GROUP_SEPARATOR_SPACE
            )
            const names = items.map((i) => i.name)
            expect(names).toContain('1 000 – 3 000')
            const aboveMax = items.find(
                (i) =>
                    i.to === undefined &&
                    i.from !== undefined &&
                    i.from !== -Infinity
            )
            expect(aboveMax).toBeDefined()
            expect(aboveMax.from).toBe(3000)
        })

        it('does not group digits with NONE separator', () => {
            const items = createLegend(style, false, DIGIT_GROUP_SEPARATOR_NONE)
            const names = items.map((i) => i.name)
            expect(names).toContain('1000 – 3000')
            const aboveMax = items.find(
                (i) =>
                    i.to === undefined &&
                    i.from !== undefined &&
                    i.from !== -Infinity
            )
            expect(aboveMax).toBeDefined()
            expect(aboveMax.from).toBe(3000)
        })

        it('includes a "less than min" item when showBelowMin is true', () => {
            const items = createLegend(
                { min: 1000, max: 3000, palette: ['#a', '#b', '#c'] },
                true,
                DIGIT_GROUP_SEPARATOR_COMMA
            )
            const belowMin = items.find((i) => i.from === -Infinity)
            expect(belowMin).toBeDefined()
            // "< min" item has no pre-formatted name; boundary is in item.to
            expect(belowMin.name).toBeUndefined()
            expect(belowMin.to).toBe(1000)
        })

        it('sets correct from/to boundaries for range items', () => {
            const items = createLegend(style, false, DIGIT_GROUP_SEPARATOR_NONE)
            const rangeItem = items.find(
                (i) => i.from !== undefined && i.to !== undefined
            )
            expect(rangeItem.from).toBe(1000)
            expect(rangeItem.to).toBe(3000)
        })
    })
})
