import * as types from '../../constants/actionTypes.js'
import {
    selectBasemap,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    changeBasemapOpacity,
} from '../basemap.js'

describe('selectBasemap', () => {
    it('creates a BASEMAP_SELECTED action', () => {
        const payload = { id: 'osm' }

        expect(selectBasemap(payload)).toEqual({
            type: types.BASEMAP_SELECTED,
            payload,
        })
    })
})

describe('toggleBasemapExpand', () => {
    it('creates a BASEMAP_TOGGLE_EXPAND action', () => {
        expect(toggleBasemapExpand()).toEqual({
            type: types.BASEMAP_TOGGLE_EXPAND,
        })
    })
})

describe('toggleBasemapVisibility', () => {
    it('creates a BASEMAP_TOGGLE_VISIBILITY action', () => {
        expect(toggleBasemapVisibility()).toEqual({
            type: types.BASEMAP_TOGGLE_VISIBILITY,
        })
    })
})

describe('changeBasemapOpacity', () => {
    it('creates a BASEMAP_CHANGE_OPACITY action', () => {
        expect(changeBasemapOpacity(0.5)).toEqual({
            type: types.BASEMAP_CHANGE_OPACITY,
            opacity: 0.5,
        })
    })
})
