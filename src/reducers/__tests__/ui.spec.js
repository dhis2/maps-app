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

describe('ui reducer — showOnlySelected', () => {
    it('defaults to false', () => {
        expect(ui(undefined, {}).showOnlySelected).toBe(false)
    })

    it('toggles on TOGGLE_SHOW_ONLY_SELECTED', () => {
        const state = ui(undefined, { type: types.TOGGLE_SHOW_ONLY_SELECTED })
        expect(state.showOnlySelected).toBe(true)

        const toggledBack = ui(state, {
            type: types.TOGGLE_SHOW_ONLY_SELECTED,
        })
        expect(toggledBack.showOnlySelected).toBe(false)
    })

    it('sets an explicit value on SHOW_ONLY_SELECTED_SET', () => {
        const prevState = { ...ui(undefined, {}), showOnlySelected: true }
        const state = ui(prevState, {
            type: types.SHOW_ONLY_SELECTED_SET,
            value: false,
        })

        expect(state.showOnlySelected).toBe(false)
    })

    it.each([
        types.MAP_NEW,
        types.MAP_SET,
        types.DATA_TABLE_CLOSE,
        types.DATA_TABLE_TOGGLE,
    ])('resets to false on %s', (type) => {
        const prevState = { ...ui(undefined, {}), showOnlySelected: true }
        const state = ui(prevState, { type })

        expect(state.showOnlySelected).toBe(false)
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
