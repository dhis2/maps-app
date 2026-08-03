import * as types from '../../constants/actionTypes.js'
import { setAggregations } from '../aggregations.js'

describe('setAggregations', () => {
    it('creates an AGGREGATIONS_SET action', () => {
        const payload = { count: 'sum' }

        expect(setAggregations(payload)).toEqual({
            type: types.AGGREGATIONS_SET,
            payload,
        })
    })
})
