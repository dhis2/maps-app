import * as types from '../../../../constants/actionTypes.js'
import {
    initializePeriodType,
    initializePeriods,
} from '../../shared/initializePeriod.js'
import { initializeEventLayer } from '../initializeEventLayer.js'

jest.mock('../../shared/initializePeriod.js', () => ({
    initializePeriodType: jest.fn(),
    initializePeriods: jest.fn(),
}))

describe('initializeEventLayer', () => {
    it('delegates period initialization to the shared helpers', () => {
        const dispatch = jest.fn()
        const params = { renderingStrategy: 'SINGLE' }

        initializeEventLayer(params)(dispatch)

        expect(initializePeriodType).toHaveBeenCalledWith(dispatch, params)
        expect(initializePeriods).toHaveBeenCalledWith(dispatch, params)
    })

    it('does not set org units when rows are already saved', () => {
        const dispatch = jest.fn()

        initializeEventLayer({ rows: [{ dimension: 'ou', items: [] }] })(
            dispatch
        )

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
            })
        )
    })

    it('sets org units to the org unit roots when no rows are saved', () => {
        const dispatch = jest.fn()
        const roots = [{ id: 'root1', name: 'Root' }]

        initializeEventLayer({ orgUnits: { roots } })(dispatch)

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
                payload: { dimension: 'ou', items: roots },
            })
        )
    })

    it('does not set org units when there are no org unit roots', () => {
        const dispatch = jest.fn()

        initializeEventLayer({ orgUnits: {} })(dispatch)

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
            })
        )
    })
})
