import * as types from '../../constants/actionTypes.js'
import {
    addLayer,
    removeLayer,
    duplicateLayer,
    editLayer,
    cancelLayer,
    updateLayer,
    toggleLayerExpand,
    toggleLayerVisibility,
    changeLayerOpacity,
    sortLayers,
    setLayerLoading,
} from '../layers.js'

describe('addLayer', () => {
    it('creates a LAYER_ADD action', () => {
        const config = { id: 'layer1' }

        expect(addLayer(config)).toEqual({
            type: types.LAYER_ADD,
            payload: config,
        })
    })
})

describe('removeLayer', () => {
    it('creates a LAYER_REMOVE action', () => {
        expect(removeLayer('layer1')).toEqual({
            type: types.LAYER_REMOVE,
            id: 'layer1',
        })
    })
})

describe('duplicateLayer', () => {
    it('creates a LAYER_DUPLICATE action', () => {
        expect(duplicateLayer('layer1')).toEqual({
            type: types.LAYER_DUPLICATE,
            id: 'layer1',
        })
    })
})

describe('editLayer', () => {
    it('creates a LAYER_EDIT action', () => {
        const layer = { id: 'layer1' }

        expect(editLayer(layer)).toEqual({
            type: types.LAYER_EDIT,
            payload: layer,
        })
    })
})

describe('cancelLayer', () => {
    it('creates a LAYER_CANCEL action', () => {
        expect(cancelLayer()).toEqual({ type: types.LAYER_CANCEL })
    })
})

describe('updateLayer', () => {
    it('creates a LAYER_UPDATE action', () => {
        const layer = { id: 'layer1' }

        expect(updateLayer(layer)).toEqual({
            type: types.LAYER_UPDATE,
            payload: layer,
        })
    })
})

describe('toggleLayerExpand', () => {
    it('creates a LAYER_TOGGLE_EXPAND action', () => {
        expect(toggleLayerExpand('layer1')).toEqual({
            type: types.LAYER_TOGGLE_EXPAND,
            id: 'layer1',
        })
    })
})

describe('toggleLayerVisibility', () => {
    it('creates a LAYER_TOGGLE_VISIBILITY action', () => {
        expect(toggleLayerVisibility('layer1')).toEqual({
            type: types.LAYER_TOGGLE_VISIBILITY,
            id: 'layer1',
        })
    })
})

describe('changeLayerOpacity', () => {
    it('creates a LAYER_CHANGE_OPACITY action', () => {
        expect(changeLayerOpacity('layer1', 0.5)).toEqual({
            type: types.LAYER_CHANGE_OPACITY,
            id: 'layer1',
            opacity: 0.5,
        })
    })
})

describe('sortLayers', () => {
    it('creates a LAYER_SORT action', () => {
        expect(sortLayers({ oldIndex: 0, newIndex: 2 })).toEqual({
            type: types.LAYER_SORT,
            oldIndex: 0,
            newIndex: 2,
        })
    })
})

describe('setLayerLoading', () => {
    it('creates a LAYER_LOADING_SET action', () => {
        expect(setLayerLoading('layer1')).toEqual({
            type: types.LAYER_LOADING_SET,
            id: 'layer1',
        })
    })
})
