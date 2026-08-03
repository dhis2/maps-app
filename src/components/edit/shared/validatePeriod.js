import i18n from '@dhis2/d2-i18n'
import {
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    RENDERING_STRATEGY_TIMELINE,
} from '../../../constants/layers.js'
import {
    MULTIMAP_MAX_PERIODS,
    MULTIMAP_MIN_PERIODS,
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import { countPeriods } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'

// Returns period-tab validation rules ({ condition, key, msg, tab }) for the
// given periodType. renderingStrategy is optional: pass it for dialogs that
// support Timeline/Split-by-period (only Thematic today), omit it otherwise.
export const getPeriodValidationRules = ({
    periodType,
    startDate,
    endDate,
    periods,
    renderingStrategy,
}) => {
    const periodCount = countPeriods(periods || [])
    const periodTypeRules = [
        {
            types: [START_END_DATES],
            rules: [
                {
                    condition: !!getStartEndDateError(startDate, endDate),
                    key: 'periodError',
                    msg: getStartEndDateError(startDate, endDate),
                },
            ],
        },
        {
            types: [PREDEFINED_PERIODS],
            rules: [
                {
                    condition: periodCount === 0,
                    key: 'periodError',
                    msg: i18n.t('Period is required'),
                },
                {
                    condition:
                        renderingStrategy ===
                            RENDERING_STRATEGY_SPLIT_BY_PERIOD &&
                        periodCount > MULTIMAP_MAX_PERIODS,
                    key: 'periodError',
                    msg: i18n.t(
                        'Only up to a total of {{number}} periods (including those in multi-periods) can be added to a split layer.',
                        { number: MULTIMAP_MAX_PERIODS }
                    ),
                },
                {
                    condition:
                        [
                            RENDERING_STRATEGY_TIMELINE,
                            RENDERING_STRATEGY_SPLIT_BY_PERIOD,
                        ].includes(renderingStrategy) &&
                        periodCount < MULTIMAP_MIN_PERIODS,
                    key: 'periodError',
                    msg: i18n.t(
                        'Select at least {{number}} periods or 1 multi-period.',
                        { number: MULTIMAP_MIN_PERIODS }
                    ),
                },
            ],
        },
    ]

    const rules = []
    periodTypeRules.forEach((periodTypeRule) => {
        if (periodTypeRule.types.includes(periodType)) {
            periodTypeRule.rules.forEach((r) =>
                rules.push({ ...r, tab: 'period' })
            )
        }
    })
    return rules
}
