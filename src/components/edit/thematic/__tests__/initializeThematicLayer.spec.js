import * as types from '../../../../constants/actionTypes.js'
import {
    initializePeriodType,
    initializePeriods,
} from '../../shared/initializePeriod.js'
import { initializeThematicLayer } from '../initializeThematicLayer.js'

jest.mock('../../shared/initializePeriod.js', () => ({
    initializePeriodType: jest.fn(),
    initializePeriods: jest.fn(),
}))

describe('initializeThematicLayer', () => {
    it('defaults eventStatus to ALL when not already set', () => {
        const dispatch = jest.fn()

        initializeThematicLayer({})(dispatch)

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_EVENT_STATUS_SET,
                status: 'ALL',
            })
        )
    })

    it('does not touch eventStatus when already set', () => {
        const dispatch = jest.fn()

        initializeThematicLayer({ eventStatus: 'ACTIVE' })(dispatch)

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_EVENT_STATUS_SET,
            })
        )
    })

    it('sets the default rendering strategy when not already set', () => {
        const dispatch = jest.fn()

        initializeThematicLayer({ defaultRenderingStrategy: 'SINGLE' })(
            dispatch
        )

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_RENDERING_STRATEGY_SET,
                payload: 'SINGLE',
            })
        )
    })

    it('does not touch the rendering strategy when already set', () => {
        const dispatch = jest.fn()

        initializeThematicLayer({ renderingStrategy: 'TIMELINE' })(dispatch)

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_RENDERING_STRATEGY_SET,
            })
        )
    })

    it('delegates period initialization to the shared helpers', () => {
        const dispatch = jest.fn()
        const params = { renderingStrategy: 'TIMELINE' }

        initializeThematicLayer(params)(dispatch)

        expect(initializePeriodType).toHaveBeenCalledWith(dispatch, params)
        expect(initializePeriods).toHaveBeenCalledWith(dispatch, params)
    })

    it('does not set org units when rows are already saved', () => {
        const dispatch = jest.fn()

        initializeThematicLayer({ rows: [{ dimension: 'ou', items: [] }] })(
            dispatch
        )

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
            })
        )
    })

    it('sets org units to the default level when no rows are saved and a default level exists', () => {
        const dispatch = jest.fn()
        const orgUnits = {
            levels: [
                { id: 'root', name: 'Root' },
                { id: 'lvl1', name: 'District' },
            ],
        }

        initializeThematicLayer({ orgUnits })(dispatch)

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
                payload: {
                    dimension: 'ou',
                    items: [
                        {
                            id: `LEVEL-lvl1`,
                            name: 'District',
                        },
                    ],
                },
            })
        )
    })

    it('does not set org units when no default level exists', () => {
        const dispatch = jest.fn()

        initializeThematicLayer({
            orgUnits: { levels: [{ id: 'root', name: 'Root' }] },
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
            })
        )
    })
})
