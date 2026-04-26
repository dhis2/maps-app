import {
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_NONE,
    DIGIT_GROUP_SEPARATOR_SPACE,
} from '../../constants/settings.js'
import { createLegend } from '../earthEngineLoader.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

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
            expect(names).toContain('1,000 - 3,000')
            expect(names).toContain('> 3,000')
        })

        it('formats item names with SPACE separator', () => {
            const items = createLegend(
                style,
                false,
                DIGIT_GROUP_SEPARATOR_SPACE
            )
            const names = items.map((i) => i.name)
            expect(names).toContain('1 000 - 3 000')
            expect(names).toContain('> 3 000')
        })

        it('does not group digits with NONE separator', () => {
            const items = createLegend(style, false, DIGIT_GROUP_SEPARATOR_NONE)
            const names = items.map((i) => i.name)
            expect(names).toContain('1000 - 3000')
            expect(names).toContain('> 3000')
        })

        it('includes a "less than min" item when showBelowMin is true', () => {
            const items = createLegend(
                { min: 1000, max: 3000, palette: ['#a', '#b', '#c'] },
                true,
                DIGIT_GROUP_SEPARATOR_COMMA
            )
            const belowMin = items.find((i) => i.from === -Infinity)
            expect(belowMin).toBeDefined()
            expect(belowMin.name).toBe('< 1,000')
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
