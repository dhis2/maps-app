import * as types from '../../constants/actionTypes.js'
import {
    setAnalyticalObject,
    clearAnalyticalObject,
} from '../analyticalObject.js'

describe('setAnalyticalObject', () => {
    it('creates an ANALYTICAL_OBJECT_SET action', () => {
        const ao = { id: 'ao1' }

        expect(setAnalyticalObject(ao)).toEqual({
            type: types.ANALYTICAL_OBJECT_SET,
            payload: ao,
        })
    })
})

describe('clearAnalyticalObject', () => {
    it('creates an ANALYTICAL_OBJECT_CLEAR action', () => {
        expect(clearAnalyticalObject()).toEqual({
            type: types.ANALYTICAL_OBJECT_CLEAR,
        })
    })
})
