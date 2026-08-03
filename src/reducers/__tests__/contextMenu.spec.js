import * as types from '../../constants/actionTypes.js'
import contextMenu from '../contextMenu.js'

describe('contextMenu reducer', () => {
    it('returns null by default', () => {
        expect(contextMenu(undefined, {})).toBe(null)
    })

    it('opens the context menu with the given payload', () => {
        const payload = { x: 1, y: 2 }

        expect(
            contextMenu(null, {
                type: types.MAP_CONTEXT_MENU_OPEN,
                payload,
            })
        ).toBe(payload)
    })

    it('closes the context menu', () => {
        expect(
            contextMenu({ x: 1, y: 2 }, { type: types.MAP_CONTEXT_MENU_CLOSE })
        ).toBe(null)
    })

    it('returns the current state for unknown actions', () => {
        const state = { x: 1, y: 2 }

        expect(contextMenu(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
