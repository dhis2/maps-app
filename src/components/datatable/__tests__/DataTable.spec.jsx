import { shouldClearFeatureHighlight } from '../DataTable.jsx'

// DataTable.jsx transitively imports MapApi.js (maplibre-gl), which is not
// needed here and fails to load under jsdom.
jest.mock('../../map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

describe('shouldClearFeatureHighlight', () => {
    test('clears when leaving to no element (cursor exits the window)', () => {
        // Regression: relatedTarget is null on window exit, which previously
        // threw `null.tagName` and crashed the table via the ErrorBoundary.
        expect(shouldClearFeatureHighlight({ relatedTarget: null })).toBe(true)
    })

    test('does not clear when hovering to an adjacent row cell (TD)', () => {
        expect(
            shouldClearFeatureHighlight({ relatedTarget: { tagName: 'TD' } })
        ).toBe(false)
    })

    test('clears when leaving to a non-TD element', () => {
        expect(
            shouldClearFeatureHighlight({ relatedTarget: { tagName: 'DIV' } })
        ).toBe(true)
    })
})
