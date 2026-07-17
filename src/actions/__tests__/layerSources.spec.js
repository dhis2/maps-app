import * as types from '../../constants/actionTypes.js'
import {
    initLayerSources,
    addLayerSource,
    removeLayerSource,
} from '../layerSources.js'

describe('initLayerSources', () => {
    it('creates a LAYER_SOURCES_INIT action', () => {
        const sources = ['src1', 'src2']

        expect(initLayerSources(sources)).toEqual({
            type: types.LAYER_SOURCES_INIT,
            payload: sources,
        })
    })
})

describe('addLayerSource', () => {
    it('creates a LAYER_SOURCE_ADD action', () => {
        expect(addLayerSource('src1')).toEqual({
            type: types.LAYER_SOURCE_ADD,
            payload: 'src1',
        })
    })
})

describe('removeLayerSource', () => {
    it('creates a LAYER_SOURCE_REMOVE action', () => {
        expect(removeLayerSource('src1')).toEqual({
            type: types.LAYER_SOURCE_REMOVE,
            payload: 'src1',
        })
    })
})
