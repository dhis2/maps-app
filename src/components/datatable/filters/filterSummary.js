import i18n from '@dhis2/d2-i18n'
import {
    FILTER_DATE,
    FILTER_NUMBER,
    FILTER_TEXT,
    FILTER_TIME,
    OPERATOR_AFTER,
    OPERATOR_BEFORE,
    OPERATOR_BETWEEN,
    OPERATOR_CONTAINS,
    OPERATOR_EQUAL,
    OPERATOR_GREATER,
    OPERATOR_GREATER_OR_EQUAL,
    OPERATOR_IS,
    OPERATOR_LESS,
    OPERATOR_LESS_OR_EQUAL,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_NOT_EQUAL,
    OPERATOR_ON,
    OPERATOR_STARTS_WITH,
    SENTINEL_NO_VALUE,
} from '../../../constants/dataTable.js'
import { hasCondition } from '../../../util/filter.js'
import { formatDate } from '../../../util/helpers.js'

const TEXT_SUMMARIES = {
    [OPERATOR_CONTAINS]: (value) => i18n.t('contains "{{- value}}"', { value }),
    [OPERATOR_NOT_CONTAINS]: (value) =>
        i18n.t('does not contain "{{- value}}"', { value }),
    [OPERATOR_IS]: (value) => i18n.t('is "{{- value}}"', { value }),
    [OPERATOR_STARTS_WITH]: (value) =>
        i18n.t('starts with "{{- value}}"', { value }),
}

const NUMBER_SYMBOLS = {
    [OPERATOR_EQUAL]: '=',
    [OPERATOR_NOT_EQUAL]: '≠',
    [OPERATOR_GREATER]: '>',
    [OPERATOR_GREATER_OR_EQUAL]: '≥',
    [OPERATOR_LESS]: '<',
    [OPERATOR_LESS_OR_EQUAL]: '≤',
}

const ORDERED_SUMMARIES = {
    [OPERATOR_ON]: (value, type) =>
        type === FILTER_TIME
            ? i18n.t('at {{value}}', { value })
            : i18n.t('on {{value}}', { value }),
    [OPERATOR_BEFORE]: (value) => i18n.t('before {{value}}', { value }),
    [OPERATOR_AFTER]: (value) => i18n.t('after {{value}}', { value }),
}

const formatBound = (value, type) =>
    type === FILTER_DATE ? formatDate(value) : value

const getConditionSummary = (filter) => {
    if (!hasCondition(filter)) {
        return null
    }
    const { type, operator, value, value2 } = filter
    if (type === FILTER_TEXT) {
        return TEXT_SUMMARIES[operator](value)
    }
    if (operator === OPERATOR_BETWEEN) {
        return `${formatBound(value, type)} – ${formatBound(value2, type)}`
    }
    if (type === FILTER_NUMBER) {
        return `${NUMBER_SYMBOLS[operator]} ${value}`
    }
    return ORDERED_SUMMARIES[operator](formatBound(value, type), type)
}

const getUncheckedSummary = (keys, formatKey) => {
    if (!keys.length) {
        return null
    }
    const labels = keys.map(formatKey)
    const values =
        labels.length > 2
            ? i18n.t('{{first}}, {{second}} +{{count}}', {
                  first: labels[0],
                  second: labels[1],
                  count: labels.length - 2,
              })
            : labels.join(', ')
    return i18n.t('not {{- values}}', { values })
}

// "No value" is only worth a word when it differs from what the condition sets
const getNoValueSummary = (filter, isNoValueUnchecked) => {
    if (hasCondition(filter) && !isNoValueUnchecked) {
        return i18n.t('or no value')
    }
    if (!hasCondition(filter) && isNoValueUnchecked) {
        return i18n.t('with a value')
    }
    return null
}

// Short text for the active filter chips, built from the filter alone
export const getFilterSummary = (filter, formatKey) => {
    const excluded = filter.excluded ?? []
    const unchecked = excluded.filter((key) => key !== SENTINEL_NO_VALUE)
    return [
        getConditionSummary(filter),
        getUncheckedSummary(unchecked, formatKey),
        getNoValueSummary(filter, excluded.includes(SENTINEL_NO_VALUE)),
    ]
        .filter(Boolean)
        .join(', ')
}
