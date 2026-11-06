import * as types from '../../constants/actionTypes.js'
import ui from '../ui.js'

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
