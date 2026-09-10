import {
    getCombinedAggregationTypes,
    getThematicAggregationTypes,
} from '../aggregationTypes.js'

describe('getCombinedAggregationTypes', () => {
    test('excludes DEFAULT (not meaningful outside a thematic layer)', () => {
        expect(
            getCombinedAggregationTypes().map((type) => type.id)
        ).not.toContain('DEFAULT')
    })

    test('otherwise matches the thematic layer aggregation types exactly', () => {
        const thematicNonDefault = getThematicAggregationTypes().filter(
            (type) => type.id !== 'DEFAULT'
        )
        expect(getCombinedAggregationTypes()).toEqual(thematicNonDefault)
    })
})
