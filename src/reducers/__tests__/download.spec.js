import * as types from '../../constants/actionTypes.js'
import download from '../download.js'

const defaultState = {
    showName: true,
    showDescription: true,
    showLegend: true,
    showInLegend: [],
    showOverviewMap: true,
    hasOverviewMapSpace: true,
    showNorthArrow: true,
    northArrowPosition: 'bottomright',
    includeMargins: true,
}

describe('download reducer', () => {
    it('returns the default state by default', () => {
        expect(download(undefined, {})).toEqual(defaultState)
    })

    it('merges the payload into the state', () => {
        const result = download(defaultState, {
            type: types.DOWNLOAD_CONFIG_SET,
            payload: { showName: false, format: 'png' },
        })

        expect(result).toEqual({
            ...defaultState,
            showName: false,
            format: 'png',
        })
    })

    it('returns the current state for unknown actions', () => {
        expect(download(defaultState, { type: 'UNKNOWN' })).toBe(defaultState)
    })
})
