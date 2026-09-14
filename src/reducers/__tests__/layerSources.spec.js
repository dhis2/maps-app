import * as types from '../../constants/actionTypes.js'
import layerSources from '../layerSources.js'

describe('layerSources reducer', () => {
    it('returns an empty array by default', () => {
        expect(layerSources(undefined, {})).toEqual([])
    })

    it('initializes the layer sources', () => {
        const payload = ['src1', 'src2']

        expect(
            layerSources([], { type: types.LAYER_SOURCES_INIT, payload })
        ).toBe(payload)
    })

    it('adds a layer source', () => {
        expect(
            layerSources(['src1'], {
                type: types.LAYER_SOURCE_ADD,
                payload: 'src2',
            })
        ).toEqual(['src1', 'src2'])
    })

    it('removes a layer source', () => {
        expect(
            layerSources(['src1', 'src2'], {
                type: types.LAYER_SOURCE_REMOVE,
                payload: 'src1',
            })
        ).toEqual(['src2'])
    })

    it('returns the current state for unknown actions', () => {
        const state = ['src1']

        expect(layerSources(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
