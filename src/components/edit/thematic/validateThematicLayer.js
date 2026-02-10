import i18n from '@dhis2/d2-i18n'
import { dimConf } from '../../../constants/dimension.js'
import {
    CLASSIFICATION_PREDEFINED,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    RENDERING_STRATEGY_TIMELINE,
} from '../../../constants/layers.js'
import {
    MULTIMAP_MAX_PERIODS,
    MULTIMAP_MIN_PERIODS,
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import { countPeriods } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'
import { isValidRadius } from './RadiusSelect.jsx'

export const validateThematicLayer = ({
    valueType,
    indicatorGroup,
    dataElementGroup,
    dataItem,
    program,
    periodType,
    startDate,
    endDate,
    rows,
    legendSet,
    radiusLow,
    radiusHigh,
    renderingStrategy,
    method,
    periods,
}) => {
    const errors = {}
    const setError = ({ key, msg, tab }) => {
        errors[key] = msg

        // The first error tab determines which tab to focus.
        // Validation order defines tab priority.
        errors.firstErrorTab ??= tab
    }
    const rules = []

    // Data
    const dataTypeRules = [
        {
            // Indicators
            types: [dimConf.indicator.objectName],
            rules: [
                {
                    condition: !indicatorGroup && !dataItem,
                    key: 'indicatorGroupError',
                    msg: i18n.t('Indicator group is required'),
                },
                {
                    condition: !dataItem,
                    key: 'indicatorError',
                    msg: i18n.t('Indicator is required'),
                },
            ],
        },
        {
            // Data elements & operands
            types: [dimConf.dataElement.objectName, dimConf.operand.objectName],
            rules: [
                {
                    condition: !dataElementGroup && !dataItem,
                    key: 'dataElementGroupError',
                    msg: i18n.t('Data element group is required'),
                },
                {
                    condition: !dataItem,
                    key: 'dataElementError',
                    msg: i18n.t('Data element is required'),
                },
            ],
        },
        {
            // Data sets
            types: [dimConf.dataSet.objectName],
            rules: [
                {
                    condition: !dataItem,
                    key: 'dataSetError',
                    msg: i18n.t('Data set is required'),
                },
            ],
        },
        {
            // Event data items / Program indicators
            types: [
                dimConf.eventDataItem.objectName,
                dimConf.programIndicator.objectName,
            ],
            rules: [
                {
                    condition: !program && !dataItem,
                    key: 'programError',
                    msg: i18n.t('Program is required'),
                },
                {
                    condition:
                        !dataItem &&
                        valueType === dimConf.eventDataItem.objectName,
                    key: 'eventDataItemError',
                    msg: i18n.t('Event data item is required'),
                },
                {
                    condition:
                        !dataItem &&
                        valueType === dimConf.programIndicator.objectName,
                    key: 'programIndicatorError',
                    msg: i18n.t('Program indicator is required'),
                },
            ],
        },
        {
            // Calculation
            types: [dimConf.calculation.objectName],
            rules: [
                {
                    condition: !dataItem,
                    key: 'calculationError',
                    msg: i18n.t('Calculation is required'),
                },
            ],
        },
    ]
    dataTypeRules.forEach((dataTypeRule) => {
        if (dataTypeRule.types.includes(valueType)) {
            dataTypeRule.rules.forEach((r) => rules.push({ ...r, tab: 'data' }))
        }
    })

    // Periods
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
    periodTypeRules.forEach((periodTypeRule) => {
        if (periodTypeRule.types.includes(periodType)) {
            periodTypeRule.rules.forEach((r) =>
                rules.push({ ...r, tab: 'period' })
            )
        }
    })

    rules.push(
        {
            // Org units
            condition: !getOrgUnitsFromRows(rows).length,
            key: 'orgUnitsError',
            msg: i18n.t('No organisation units are selected'),
            tab: 'orgunits',
        },
        {
            // Legend set
            condition: method === CLASSIFICATION_PREDEFINED && !legendSet,
            key: 'legendSetError',
            msg: i18n.t('No legend set is selected'),
            tab: 'style',
        },
        {
            // Radius
            condition: !isValidRadius(radiusLow, radiusHigh),
            key: 'radiusError',
            msg: i18n.t('Specified radius values are invalid'),
            tab: 'style',
        }
    )

    // Apply all rules
    rules.forEach((rule) => {
        if (rule.condition) {
            setError(rule)
        }
    })

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    }
}
