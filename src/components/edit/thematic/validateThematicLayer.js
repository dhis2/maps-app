import i18n from '@dhis2/d2-i18n'
import { CLASSIFICATION_PREDEFINED } from '../../../constants/layers.js'
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import { isValidIsolatedClass } from '../../classification/IsolatedClass.jsx'
import { getPeriodValidationRules } from '../shared/validatePeriod.js'
import { isValidRadius } from './RadiusSelect.jsx'

export const validateThematicLayer = ({
    dataItem,
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
    legendIsolated,
}) => {
    const errors = {}
    const setError = ({ key, msg, tab }) => {
        errors[key] = msg

        // The first error tab determines which tab to focus.
        // Validation order defines tab priority.
        errors.firstErrorTab ??= tab
    }
    const rules = [
        {
            // Data
            condition: !dataItem,
            key: 'dataError',
            msg: i18n.t('Data is required'),
            tab: 'data',
        },
    ]

    // Periods
    rules.push(
        ...getPeriodValidationRules({
            periodType,
            startDate,
            endDate,
            periods,
            renderingStrategy,
        }),
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
        },
        {
            // Isolated class
            condition: !isValidIsolatedClass(legendIsolated),
            key: 'isolatedClassError',
            msg: i18n.t('Isolated class max should be greater than min'),
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
