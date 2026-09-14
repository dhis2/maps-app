import * as types from '../../constants/actionTypes.js'
import aggregations from '../aggregations.js'

describe('aggregations reducer', () => {
    it('returns an empty object by default', () => {
        expect(aggregations(undefined, {})).toEqual({})
    })

    it('merges the payload into the state', () => {
        const result = aggregations(
            { layer1: 'sum' },
            {
                type: types.AGGREGATIONS_SET,
                payload: { layer2: 'avg' },
            }
        )

        expect(result).toEqual({ layer1: 'sum', layer2: 'avg' })
    })

    it.each([types.MAP_NEW, types.MAP_SET])(
        'resets to an empty object on %s',
        (type) => {
            expect(aggregations({ layer1: 'sum' }, { type })).toEqual({})
        }
    )

    it('clears the aggregation for a removed layer', () => {
        const result = aggregations(
            { layer1: 'sum', layer2: 'avg' },
            { type: types.LAYER_REMOVE, id: 'layer1' }
        )

        expect(result).toEqual({ layer1: undefined, layer2: 'avg' })
    })

    it('clears the aggregation for an updated layer', () => {
        const result = aggregations(
            { layer1: 'sum', layer2: 'avg' },
            { type: types.LAYER_UPDATE, payload: { id: 'layer1' } }
        )

        expect(result).toEqual({ layer1: undefined, layer2: 'avg' })
    })

    it('returns the current state when the affected layer has no aggregation set', () => {
        const state = { layer2: 'avg' }

        expect(
            aggregations(state, { type: types.LAYER_REMOVE, id: 'layer1' })
        ).toBe(state)
    })

    it('returns the current state for unknown actions', () => {
        const state = { layer1: 'sum' }

        expect(aggregations(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
