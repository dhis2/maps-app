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
    const setErrorState = ({ key, msg, tab }) => {
        errors[key] = msg
        if (!errors.tab) {
            errors.tab = tab
        }
    }

    // Indicators
    if (valueType === dimConf.indicator.objectName) {
        if (!indicatorGroup && !dataItem) {
            setErrorState({
                key: 'indicatorGroupError',
                msg: i18n.t('Indicator group is required'),
                tab: 'data',
            })
        }
        if (!dataItem) {
            setErrorState({
                key: 'indicatorError',
                msg: i18n.t('Indicator is required'),
                tab: 'data',
            })
        }
    }

    // Data elements & operands
    if (
        [dimConf.dataElement.objectName, dimConf.operand.objectName].includes(
            valueType
        )
    ) {
        if (!dataElementGroup && !dataItem) {
            setErrorState({
                key: 'dataElementGroupError',
                msg: i18n.t('Data element group is required'),
                tab: 'data',
            })
        }
        if (!dataItem) {
            setErrorState({
                key: 'dataElementError',
                msg: i18n.t('Data element is required'),
                tab: 'data',
            })
        }
    }

    // Data sets
    if (valueType === dimConf.dataSet.objectName && !dataItem) {
        setErrorState({
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
        if (!program && !dataItem) {
            setErrorState({
                key: 'programError',
                msg: i18n.t('Program is required'),
                tab: 'data',
            })
        }
        if (!dataItem) {
            if (valueType === dimConf.eventDataItem.objectName) {
                setErrorState({
                    key: 'eventDataItemError',
                    msg: i18n.t('Event data item is required'),
                    tab: 'data',
                })
            } else {
                setErrorState({
                    key: 'programIndicatorError',
                    msg: i18n.t('Program indicator is required'),
                    tab: 'data',
                })
            }
        }
    }

    // Calculation
    if (valueType === dimConf.calculation.objectName && !dataItem) {
        setErrorState({
            key: 'calculationError',
            msg: i18n.t('Calculation is required'),
            tab: 'data',
        })
    }

    // Periods
    if (periodType !== START_END_DATES) {
        if ((periods ?? []).length === 0) {
            setErrorState({
                key: 'periodError',
                msg: i18n.t('Period is required'),
                tab: 'period',
            })
        }
        if (
            [RENDERING_STRATEGY_SPLIT_BY_PERIOD].includes(renderingStrategy) &&
            countPeriods(periods) > MULTIMAP_MAX_PERIODS
        ) {
            setErrorState({
                key: 'periodError',
                msg: i18n.t(
                    'Only up to a total of {{number}} periods (including those in multi-periods) can be added to a split layer.',
                    { number: MULTIMAP_MAX_PERIODS }
                ),
                tab: 'period',
            })
        }
        if (
            [
                RENDERING_STRATEGY_TIMELINE,
                RENDERING_STRATEGY_SPLIT_BY_PERIOD,
            ].includes(renderingStrategy) &&
            countPeriods(periods) < MULTIMAP_MIN_PERIODS
        ) {
            setErrorState({
                key: 'periodError',
                msg: i18n.t(
                    'Select at least {{number}} periods or 1 multi-period.',
                    { number: MULTIMAP_MIN_PERIODS }
                ),
                tab: 'period',
            })
        }
    }
    if (periodType === START_END_DATES) {
        const error = getStartEndDateError(startDate, endDate)
        if (error) {
            setErrorState({
                key: 'periodError',
                msg: error,
                tab: 'period',
            })
        }
    }

    // Org units
    if (!getOrgUnitsFromRows(rows).length) {
        setErrorState({
            key: 'orgUnitsError',
            msg: i18n.t('No organisation units are selected'),
            tab: 'orgunits',
        })
    }

    // Legend set
    if (method === CLASSIFICATION_PREDEFINED && !legendSet) {
        setErrorState({
            key: 'legendSetError',
            msg: i18n.t('No legend set is selected'),
            tab: 'style',
        })
    }

    // Radius
    if (!isValidRadius(radiusLow, radiusHigh)) {
        setErrorState({
            key: 'radiusError',
            msg: i18n.t('Specified radius values are invalid'),
            tab: 'style',
        })
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    }
}
