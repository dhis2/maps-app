import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../../constants/periods.js'
import { initializePeriodType } from '../initializePeriod.js'

describe('initializePeriodType', () => {
    it('does nothing if periodType is already set', () => {
        const dispatch = jest.fn()

        initializePeriodType(dispatch, {
            periodType: PREDEFINED_PERIODS,
            filters: [],
            startDate: '2023-01-01',
            endDate: '2023-12-31',
        })

        expect(dispatch).not.toHaveBeenCalled()
    })

    it('defaults to PREDEFINED_PERIODS when neither a period nor dates are set', () => {
        const dispatch = jest.fn()

        initializePeriodType(dispatch, {
            filters: undefined,
            startDate: undefined,
            endDate: undefined,
        })

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                periodType: { value: PREDEFINED_PERIODS },
                keepPeriod: true,
            })
        )
    })

    it('defaults to START_END_DATES when only dates are set', () => {
        const dispatch = jest.fn()

        initializePeriodType(dispatch, {
            filters: undefined,
            startDate: '2023-01-01',
            endDate: '2023-12-31',
        })

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                periodType: { value: START_END_DATES },
                keepPeriod: false,
            })
        )
    })

    it('defaults to PREDEFINED_PERIODS when only a period is set', () => {
        const dispatch = jest.fn()

        initializePeriodType(dispatch, {
            filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
            startDate: undefined,
            endDate: undefined,
        })

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                periodType: { value: PREDEFINED_PERIODS },
                keepPeriod: true,
            })
        )
    })

    // Regression: legacy saved layers can carry a period selection alongside
    // stale start/end dates left over from before the period was picked.
    // The period must win so re-opening the dialog doesn't silently switch
    // to "start/end dates" and lose the saved period.
    it('prefers a saved period over stale start/end dates', () => {
        const dispatch = jest.fn()

        initializePeriodType(dispatch, {
            filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
            startDate: '2019-01-01',
            endDate: '2020-01-01',
        })

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                periodType: { value: PREDEFINED_PERIODS },
                keepPeriod: true,
            })
        )
    })
})
