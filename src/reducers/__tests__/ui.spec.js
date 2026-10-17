import * as types from '../../constants/actionTypes.js'
import ui from '../ui.js'

const baseState = {
    width: 1024,
    height: 768,
    layersPanelOpen: true,
    rightPanelOpen: false,
    dataTableHeight: 300,
    mapContextMenu: true,
    downloadMode: false,
    layersSorting: false,
}

describe('ui reducer', () => {
    it('returns a default state by default', () => {
        const result = ui(undefined, {})

        expect(result).toMatchObject({
            layersPanelOpen: true,
            rightPanelOpen: false,
            dataTableHeight: 300,
            mapContextMenu: true,
            downloadMode: false,
            layersSorting: false,
        })
    })

    it('opens the layers panel', () => {
        const result = ui(
            { ...baseState, layersPanelOpen: false },
            { type: types.LAYERS_PANEL_OPEN }
        )

        expect(result.layersPanelOpen).toBe(true)
    })

    it('closes the layers panel', () => {
        const result = ui(baseState, { type: types.LAYERS_PANEL_CLOSE })

        expect(result.layersPanelOpen).toBe(false)
    })

    it.each([
        types.INTERPRETATIONS_PANEL_OPEN,
        types.ORGANISATION_UNIT_PROFILE_SET,
        types.FEATURE_PROFILE_SET,
    ])('opens the right panel on %s', (type) => {
        const result = ui(baseState, { type })

        expect(result.rightPanelOpen).toBe(true)
    })

    it.each([
        types.INTERPRETATIONS_PANEL_CLOSE,
        types.ORGANISATION_UNIT_PROFILE_CLOSE,
        types.FEATURE_PROFILE_CLOSE,
        types.MAP_NEW,
        types.MAP_SET,
    ])('closes the right panel on %s', (type) => {
        const result = ui({ ...baseState, rightPanelOpen: true }, { type })

        expect(result.rightPanelOpen).toBe(false)
    })

    it('opens download mode', () => {
        const result = ui(baseState, { type: types.DOWNLOAD_MODE_OPEN })

        expect(result.downloadMode).toBe(true)
    })

    it('closes download mode and the right panel', () => {
        const result = ui(
            { ...baseState, downloadMode: true, rightPanelOpen: true },
            { type: types.DOWNLOAD_MODE_CLOSE }
        )

        expect(result.downloadMode).toBe(false)
        expect(result.rightPanelOpen).toBe(false)
    })

    it('resizes the data table', () => {
        const result = ui(baseState, {
            type: types.DATA_TABLE_RESIZE,
            height: 500,
        })

        expect(result.dataTableHeight).toBe(500)
    })

    it('starts layers sorting', () => {
        const result = ui(baseState, { type: types.LAYERS_SORTING_START })

        expect(result.layersSorting).toBe(true)
    })

    it('ends layers sorting', () => {
        const result = ui(
            { ...baseState, layersSorting: true },
            { type: types.LAYERS_SORTING_END }
        )

        expect(result.layersSorting).toBe(false)
    })

    it('returns the current state for unknown actions', () => {
        expect(ui(baseState, { type: 'UNKNOWN' })).toBe(baseState)
    })
})
