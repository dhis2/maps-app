import {
    createBubbleItems,
    createSingleColorBubbles,
    computeLayout,
} from '../bubbles.js'

// Mocks
jest.mock('@dhis2/d2-i18n', () => ({
    t: jest.fn((str) => str),
}))

jest.mock('d3-format', () => ({
    precisionRound: jest.fn(() => 1),
}))

jest.mock('../../components/legend/Bubbles.js', () => ({
    digitWidth: 5,
    guideLength: 10,
    textPadding: 2,
}))

jest.mock('../colors.js', () => ({
    getContrastColor: jest.fn(() => '#fff'),
}))

jest.mock('../helpers.js', () => ({
    getLongestTextLength: jest.fn(() => 3),
}))

jest.mock('../numbers.js', () => ({
    getRoundToPrecisionFn: jest.fn(() => (n) => n),
}))

describe('createBubbleItems', () => {
    it('should create bubble items from class breaks', () => {
        const mockScale = {
            domain: jest.fn(() => (value) => value * 2),
        }

        const result = createBubbleItems({
            classes: [
                { startValue: 10, endValue: 20, color: '#aaa' },
                { startValue: 20, endValue: 30, color: '#bbb' },
            ],
            minValue: 10,
            maxValue: 30,
            scale: mockScale,
            radiusHigh: 50,
        })

        expect(result).toEqual([
            { radius: 60, maxRadius: 50, color: '#bbb', text: '30' },
            { radius: 40, maxRadius: 50, color: '#aaa', text: '20' },
            { radius: 20, maxRadius: 50, text: '10' },
        ])
    })
})

describe('createSingleColorBubbles', () => {
    it('should return three bubbles with single color and formatted values', () => {
        const mockScale = {
            domain: jest.fn(() => (value) => value * 0.5),
        }

        const result = createSingleColorBubbles({
            color: '#123456',
            minValue: 0,
            maxValue: 100,
            scale: mockScale,
            radiusLow: 10,
            radiusHigh: 50,
        })

        expect(result).toEqual([
            {
                radius: 50,
                maxRadius: 50,
                color: '#123456',
                stroke: '#fff',
                text: '100',
            },
            {
                radius: 25,
                maxRadius: 50,
                color: '#123456',
                stroke: '#fff',
                text: '50',
            },
            {
                radius: 10,
                maxRadius: 50,
                color: '#123456',
                stroke: '#fff',
                text: '0',
            },
        ])
    })
})

describe('computeLayout', () => {
    it('should compute layout with alternating when legendWidth allows', () => {
        const bubbles = [
            { radius: 50, text: '100' },
            { radius: 45, text: '50' },
            { radius: 40, text: '0' },
        ]

        const result = computeLayout({
            bubbles,
            bubbleClasses: [
                { startValue: 0, endValue: 30 },
                { startValue: 30, endValue: 60 },
            ],
            radiusHigh: 50,
            legendWidth: 500,
        })

        expect(result.alternate).toBe(true)
        expect(result.offset).toBe(27)
        expect(result.showNumbers).toBeUndefined()
    })

    it('should compute layout and return showNumbers when bubbles are cramped', () => {
        const bubbles = [
            { radius: 10, text: '100' },
            { radius: 8, text: '80' },
            { radius: 6, text: '60' },
            { radius: 4, text: '40' },
            { radius: 2, text: '20' },
            { radius: 0, text: '0' },
        ]

        const result = computeLayout({
            bubbles,
            bubbleClasses: [
                { startValue: 0, endValue: 50 },
                { startValue: 50, endValue: 100 },
            ],
            radiusHigh: 15,
            legendWidth: 100,
        })

        expect(result.alternate).toBe(false)
        expect(result.offset).toBe(27)
        expect(result.showNumbers).toContain(0)
        expect(result.showNumbers).toContain(bubbles.length - 1)
    })
})
