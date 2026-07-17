import * as types from '../../constants/actionTypes.js'
import {
    newMap,
    setMap,
    setMapProps,
    openCoordinatePopup,
    closeCoordinatePopup,
    openContextMenu,
    closeContextMenu,
    showEarthEngineValue,
    clearAlerts,
    syncMapPeriods,
} from '../map.js'

describe('newMap', () => {
    it('creates a MAP_NEW action', () => {
        expect(newMap()).toEqual({ type: types.MAP_NEW })
    })
})

describe('setMap', () => {
    it('creates a MAP_SET action', () => {
        const config = { id: 'map1' }

        expect(setMap(config)).toEqual({
            type: types.MAP_SET,
            payload: config,
        })
    })
})

describe('setMapProps', () => {
    it('creates a MAP_PROPS_SET action', () => {
        const props = { zoom: 5 }

        expect(setMapProps(props)).toEqual({
            type: types.MAP_PROPS_SET,
            payload: props,
        })
    })
})

describe('openCoordinatePopup', () => {
    it('creates a MAP_COORDINATE_OPEN action', () => {
        const coord = [1, 2]

        expect(openCoordinatePopup(coord)).toEqual({
            type: types.MAP_COORDINATE_OPEN,
            payload: coord,
        })
    })
})

describe('closeCoordinatePopup', () => {
    it('creates a MAP_COORDINATE_CLOSE action', () => {
        expect(closeCoordinatePopup()).toEqual({
            type: types.MAP_COORDINATE_CLOSE,
        })
    })
})

describe('openContextMenu', () => {
    it('creates a MAP_CONTEXT_MENU_OPEN action', () => {
        const payload = { x: 1, y: 2 }

        expect(openContextMenu(payload)).toEqual({
            type: types.MAP_CONTEXT_MENU_OPEN,
            payload,
        })
    })
})

describe('closeContextMenu', () => {
    it('creates a MAP_CONTEXT_MENU_CLOSE action', () => {
        expect(closeContextMenu()).toEqual({
            type: types.MAP_CONTEXT_MENU_CLOSE,
        })
    })
})

describe('showEarthEngineValue', () => {
    it('creates a MAP_EARTH_ENGINE_VALUE_SHOW action', () => {
        const coordinate = [1, 2]

        expect(showEarthEngineValue('layer1', coordinate)).toEqual({
            type: types.MAP_EARTH_ENGINE_VALUE_SHOW,
            layerId: 'layer1',
            coordinate,
        })
    })
})

describe('clearAlerts', () => {
    it('creates a MAP_ALERTS_CLEAR action', () => {
        expect(clearAlerts()).toEqual({ type: types.MAP_ALERTS_CLEAR })
    })
})

describe('syncMapPeriods', () => {
    it('creates a MAP_PERIODS_SYNC action', () => {
        const periods = [{ id: '2021' }]

        expect(syncMapPeriods(periods, 'SINGLE')).toEqual({
            type: types.MAP_PERIODS_SYNC,
            periods,
            renderingStrategy: 'SINGLE',
        })
    })
})
