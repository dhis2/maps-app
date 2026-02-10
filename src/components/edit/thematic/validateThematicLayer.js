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

    // Indicators
    if (valueType === dimConf.indicator.objectName) {
        rules.push(
            {
                condition: !indicatorGroup && !dataItem,
                key: 'indicatorGroupError',
                msg: i18n.t('Indicator group is required'),
                tab: 'data',
            },
            {
                condition: !dataItem,
                key: 'indicatorError',
                msg: i18n.t('Indicator is required'),
                tab: 'data',
            }
        )
    }

    // Data elements & operands
    if (
        [dimConf.dataElement.objectName, dimConf.operand.objectName].includes(
            valueType
        )
    ) {
        rules.push(
            {
                condition: !dataElementGroup && !dataItem,
                key: 'dataElementGroupError',
                msg: i18n.t('Data element group is required'),
                tab: 'data',
            },
            {
                condition: !dataItem,
                key: 'dataElementError',
                msg: i18n.t('Data element is required'),
                tab: 'data',
            }
        )
    }

    // Data sets
    if (valueType === dimConf.dataSet.objectName && !dataItem) {
        rules.push({
            condition: true,
            key: 'dataSetError',
            msg: i18n.t('Data set is required'),
            tab: 'data',
        })
    }

    // Event data items / Program indicators
    if (
        [
            dimConf.eventDataItem.objectName,
            dimConf.programIndicator.objectName,
        ].includes(valueType)
    ) {
        rules.push(
            {
                condition: !program && !dataItem,
                key: 'programError',
                msg: i18n.t('Program is required'),
                tab: 'data',
            },
            {
                condition:
                    !dataItem && valueType === dimConf.eventDataItem.objectName,
                key: 'eventDataItemError',
                msg: i18n.t('Event data item is required'),
                tab: 'data',
            },
            {
                condition:
                    !dataItem &&
                    valueType === dimConf.programIndicator.objectName,
                key: 'programIndicatorError',
                msg: i18n.t('Program indicator is required'),
                tab: 'data',
            }
        )
    }

    // Calculation
    if (valueType === dimConf.calculation.objectName && !dataItem) {
        rules.push({
            condition: true,
            key: 'calculationError',
            msg: i18n.t('Calculation is required'),
            tab: 'data',
        })
    }

    // Periods
    if (periodType === START_END_DATES) {
        const error = getStartEndDateError(startDate, endDate)
        rules.push({
            condition: !!error,
            key: 'periodError',
            msg: error,
            tab: 'period',
        })
    } else {
        const periodCount = countPeriods(periods)
        rules.push(
            {
                condition: periodCount === 0,
                key: 'periodError',
                msg: i18n.t('Period is required'),
                tab: 'period',
            },
            {
                condition:
                    renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD &&
                    periodCount > MULTIMAP_MAX_PERIODS,
                key: 'periodError',
                msg: i18n.t(
                    'Only up to a total of {{number}} periods (including those in multi-periods) can be added to a split layer.',
                    { number: MULTIMAP_MAX_PERIODS }
                ),
                tab: 'period',
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
                tab: 'period',
            }
        )
    }

    rules.push(
        // Org units
        {
            condition: !getOrgUnitsFromRows(rows).length,
            key: 'orgUnitsError',
            msg: i18n.t('No organisation units are selected'),
            tab: 'orgunits',
        },
        // Legend set
        {
            condition: method === CLASSIFICATION_PREDEFINED && !legendSet,
            key: 'legendSetError',
            msg: i18n.t('No legend set is selected'),
            tab: 'style',
        },
        // Radius
        {
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
