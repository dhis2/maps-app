import * as types from '../../constants/actionTypes.js'
import ui from '../ui.js'

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
