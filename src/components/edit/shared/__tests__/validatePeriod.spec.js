import {
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    RENDERING_STRATEGY_TIMELINE,
} from '../../../../constants/layers.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../../constants/periods.js'
import { getPeriodValidationRules } from '../validatePeriod.js'

describe('getPeriodValidationRules', () => {
    it('returns no rules for a periodType with no validation rules defined', () => {
        expect(getPeriodValidationRules({ periodType: 'UNKNOWN' })).toEqual([])
    })

    describe('START_END_DATES', () => {
        it('is not in error for a valid date range', () => {
            const rules = getPeriodValidationRules({
                periodType: START_END_DATES,
                startDate: '2021-01-01',
                endDate: '2021-12-31',
            })

            expect(rules).toHaveLength(1)
            expect(rules[0]).toMatchObject({
                condition: false,
                key: 'periodError',
                tab: 'period',
            })
        })

        it('is in error when the end date is before the start date', () => {
            const rules = getPeriodValidationRules({
                periodType: START_END_DATES,
                startDate: '2021-12-31',
                endDate: '2021-01-01',
            })

            expect(rules[0]).toMatchObject({
                condition: true,
                msg: 'End date cannot be earlier than start date',
            })
        })
    })

    describe('PREDEFINED_PERIODS', () => {
        it('requires at least one period', () => {
            const rules = getPeriodValidationRules({
                periodType: PREDEFINED_PERIODS,
                periods: [],
            })

            expect(rules).toHaveLength(3)
            expect(rules[0]).toMatchObject({
                condition: true,
                msg: 'Period is required',
            })
        })

        it('is not in error when a single period is selected with no rendering strategy', () => {
            const rules = getPeriodValidationRules({
                periodType: PREDEFINED_PERIODS,
                periods: [{ id: 'p1' }],
            })

            expect(rules.every((rule) => rule.condition === false)).toBe(true)
        })

        it('rejects more than MULTIMAP_MAX_PERIODS periods for a split-by-period layer', () => {
            const periods = Array.from({ length: 13 }, (_, i) => ({
                id: `p${i}`,
            }))

            const rules = getPeriodValidationRules({
                periodType: PREDEFINED_PERIODS,
                periods,
                renderingStrategy: RENDERING_STRATEGY_SPLIT_BY_PERIOD,
            })

            expect(rules[0].condition).toBe(false)
            expect(rules[1]).toMatchObject({
                condition: true,
                msg: 'Only up to a total of 12 periods (including those in multi-periods) can be added to a split layer.',
            })
            expect(rules[2].condition).toBe(false)
        })

        it('requires at least MULTIMAP_MIN_PERIODS periods for a timeline layer', () => {
            const rules = getPeriodValidationRules({
                periodType: PREDEFINED_PERIODS,
                periods: [{ id: 'p1' }],
                renderingStrategy: RENDERING_STRATEGY_TIMELINE,
            })

            expect(rules[1].condition).toBe(false)
            expect(rules[2]).toMatchObject({
                condition: true,
                msg: 'Select at least 2 periods or 1 multi-period.',
            })
        })
    })
})
