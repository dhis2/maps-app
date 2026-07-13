import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../../constants/periods.js'
import { initializePeriodType, initializePeriods } from '../initializePeriod.js'

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

describe('initializePeriods', () => {
    it('does nothing for a layer that already has saved filters', () => {
        const dispatch = jest.fn()

        initializePeriods(dispatch, {
            filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
            startDate: undefined,
            endDate: undefined,
        })

        expect(dispatch).not.toHaveBeenCalled()
    })

    it('does nothing for a layer that already has saved start/end dates', () => {
        const dispatch = jest.fn()

        initializePeriods(dispatch, {
            filters: undefined,
            startDate: '2023-01-01',
            endDate: '2023-12-31',
        })

        expect(dispatch).not.toHaveBeenCalled()
    })

    // Regression: the seeded backup must not carry a `type`, since a later
    // effect reads `backupPeriodsDates.type === START_END_DATES` to decide
    // whether to force period type back to start/end dates on strategy
    // switches. Seeding a type here caused that to misfire on brand-new
    // layers that never touched start/end dates.
    it('seeds a typeless backup and empty periods for a new layer with no sync source', () => {
        const dispatch = jest.fn()

        initializePeriods(dispatch, {
            filters: undefined,
            startDate: undefined,
            endDate: undefined,
            renderingStrategy: undefined,
            defaultRenderingStrategy: 'SINGLE',
            systemSettings: {},
            syncFromOtherLayers: jest.fn(),
            shouldSyncFromOtherLayers: false,
        })

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                backupPeriodsDates: {
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                },
            })
        )
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ periods: [] })
        )
    })

    it("adopts a sibling layer's periods when syncFromOtherLayers succeeds", () => {
        const dispatch = jest.fn()
        const syncFromOtherLayers = jest.fn().mockReturnValue(true)

        initializePeriods(dispatch, {
            filters: undefined,
            startDate: undefined,
            endDate: undefined,
            renderingStrategy: undefined,
            defaultRenderingStrategy: 'TIMELINE',
            systemSettings: {},
            syncFromOtherLayers,
            shouldSyncFromOtherLayers: true,
        })

        // Falls back to defaultRenderingStrategy when renderingStrategy isn't set yet
        expect(syncFromOtherLayers).toHaveBeenCalledWith({
            renderingStrategy: 'TIMELINE',
        })
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                backupPeriodsDates: expect.objectContaining({
                    type: PREDEFINED_PERIODS,
                    periods: [],
                }),
            })
        )
        // The sync-success branch never clears periods itself -
        // syncFromOtherLayers already dispatched setPeriods internally.
        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ periods: [] })
        )
    })

    it('falls back to the typeless seed when a sibling sync is attempted but fails', () => {
        const dispatch = jest.fn()
        const syncFromOtherLayers = jest.fn().mockReturnValue(false)

        initializePeriods(dispatch, {
            filters: undefined,
            startDate: undefined,
            endDate: undefined,
            renderingStrategy: 'TIMELINE',
            defaultRenderingStrategy: 'TIMELINE',
            systemSettings: {},
            syncFromOtherLayers,
            shouldSyncFromOtherLayers: true,
        })

        expect(syncFromOtherLayers).toHaveBeenCalledWith({
            renderingStrategy: 'TIMELINE',
        })
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                backupPeriodsDates: {
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                },
            })
        )
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ periods: [] })
        )
    })
})
