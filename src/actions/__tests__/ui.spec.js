import * as types from '../../constants/actionTypes.js'
import {
    openLayersPanel,
    closeLayersPanel,
    openInterpretationsPanel,
    closeInterpretationsPanel,
    openDownloadMode,
    closeDownloadMode,
    layersSortingStart,
    layersSortingEnd,
} from '../ui.js'

describe('ui actions', () => {
    it('creates a LAYERS_PANEL_OPEN action', () => {
        expect(openLayersPanel()).toEqual({ type: types.LAYERS_PANEL_OPEN })
    })

    it('creates a LAYERS_PANEL_CLOSE action', () => {
        expect(closeLayersPanel()).toEqual({ type: types.LAYERS_PANEL_CLOSE })
    })

    it('creates an INTERPRETATIONS_PANEL_OPEN action', () => {
        expect(openInterpretationsPanel()).toEqual({
            type: types.INTERPRETATIONS_PANEL_OPEN,
        })
    })

    it('creates an INTERPRETATIONS_PANEL_CLOSE action', () => {
        expect(closeInterpretationsPanel()).toEqual({
            type: types.INTERPRETATIONS_PANEL_CLOSE,
        })
    })

    it('creates a DOWNLOAD_MODE_OPEN action', () => {
        expect(openDownloadMode()).toEqual({ type: types.DOWNLOAD_MODE_OPEN })
    })

    it('creates a DOWNLOAD_MODE_CLOSE action', () => {
        expect(closeDownloadMode()).toEqual({
            type: types.DOWNLOAD_MODE_CLOSE,
        })
    })

    it('creates a LAYERS_SORTING_START action', () => {
        expect(layersSortingStart()).toEqual({
            type: types.LAYERS_SORTING_START,
        })
    })

    it('creates a LAYERS_SORTING_END action', () => {
        expect(layersSortingEnd()).toEqual({ type: types.LAYERS_SORTING_END })
    })
})
