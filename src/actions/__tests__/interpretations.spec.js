import * as types from '../../constants/actionTypes.js'
import { setInterpretation } from '../interpretations.js'

describe('setInterpretation', () => {
    it('creates an INTERPRETATION_SET action', () => {
        expect(setInterpretation('int1')).toEqual({
            type: types.INTERPRETATION_SET,
            payload: 'int1',
        })
    })
})
