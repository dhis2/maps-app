import * as types from '../../constants/actionTypes.js'
import ui from '../ui.js'

describe('ui reducer — highlightColor', () => {
    it('defaults to null (no color override until the user picks one)', () => {
        expect(ui(undefined, {}).highlightColor).toBe(null)
    })

    it('sets a new highlight color', () => {
        const state = ui(undefined, {
            type: types.HIGHLIGHT_COLOR_SET,
            color: '#FF0000',
        })

        expect(state.highlightColor).toBe('#FF0000')
    })

    it('leaves other state untouched', () => {
        const prevState = { ...ui(undefined, {}), dataTableHeight: 400 }
        const state = ui(prevState, {
            type: types.HIGHLIGHT_COLOR_SET,
            color: '#FF0000',
        })

        expect(state.dataTableHeight).toBe(400)
    })
})

describe('ui reducer — selectionFilter', () => {
    it('defaults to an empty array', () => {
        expect(ui(undefined, {}).selectionFilter).toEqual([])
    })

    it('sets an explicit value on SELECTION_FILTER_SET', () => {
        const state = ui(undefined, {
            type: types.SELECTION_FILTER_SET,
            value: ['selected'],
        })

        expect(state.selectionFilter).toEqual(['selected'])
    })

    it.each([
        types.MAP_NEW,
        types.MAP_SET,
        types.DATA_TABLE_CLOSE,
        types.DATA_TABLE_TOGGLE,
    ])('resets to an empty array on %s', (type) => {
        const prevState = {
            ...ui(undefined, {}),
            selectionFilter: ['selected'],
        }
        const state = ui(prevState, { type })

        expect(state.selectionFilter).toEqual([])
    })
})

describe('ui reducer — lastClickedFeature', () => {
    it('defaults to null', () => {
        expect(ui(undefined, {}).lastClickedFeature).toBe(null)
    })

    it('sets the clicked feature on MAP_FEATURE_CLICKED', () => {
        const payload = { id: 'abc', layerId: 'layer-1' }
        const state = ui(undefined, {
            type: types.MAP_FEATURE_CLICKED,
            payload,
        })

        expect(state.lastClickedFeature).toEqual(payload)
    })

    it.each([types.MAP_NEW, types.MAP_SET])('resets to null on %s', (type) => {
        const prevState = {
            ...ui(undefined, {}),
            lastClickedFeature: { id: 'abc', layerId: 'layer-1' },
        }
        const state = ui(prevState, { type })

        expect(state.lastClickedFeature).toBe(null)
    })
})

describe('ui reducer — activeTimelinePeriod', () => {
    it('defaults to null', () => {
        expect(ui(undefined, {}).activeTimelinePeriod).toBe(null)
    })

    it('sets the active timeline period on ACTIVE_TIMELINE_PERIOD_SET', () => {
        const period = { id: '202301', name: 'January 2023' }
        const state = ui(undefined, {
            type: types.ACTIVE_TIMELINE_PERIOD_SET,
            period,
        })

        expect(state.activeTimelinePeriod).toEqual(period)
    })
})
