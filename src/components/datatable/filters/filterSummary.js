import i18n from '@dhis2/d2-i18n'
import {
    FILTER_DATE,
    FILTER_NUMBER,
    FILTER_OPTIONS,
    FILTER_TEXT,
    OPERATOR_BETWEEN,
    OPERATOR_EMPTY,
    OPERATOR_NOT_EMPTY,
    SENTINEL_NO_VALUE,
} from '../../../constants/dataTable.js'
import { formatDate } from '../../../util/helpers.js'
import { getNumberOperators } from './filterOperators.js'

const getOptionsSummary = (values, formatValue) => {
    const labels = values.map((value) =>
        value === SENTINEL_NO_VALUE ? i18n.t('No value') : formatValue(value)
    )
    return labels.length > 2
        ? i18n.t('{{first}}, {{second}} +{{count}}', {
              first: labels[0],
              second: labels[1],
              count: labels.length - 2,
          })
        : labels.join(', ')
}

const getDateSummary = ({ from, to }) => {
    if (from && to) {
        return `${formatDate(from)} – ${formatDate(to)}`
    }
    return from
        ? i18n.t('from {{date}}', { date: formatDate(from) })
        : i18n.t('until {{date}}', { date: formatDate(to) })
}

const getNumberSummary = ({ operator, value, value2 }) => {
    if (operator === OPERATOR_BETWEEN) {
        return `${value} – ${value2}`
    }
    const { symbol } = getNumberOperators().find((o) => o.value === operator)
    return `${symbol} ${value}`
}

// Short text for the active filter chips; values read as the table cells
export const getFilterSummary = (filter, formatValue) => {
    if (filter.operator === OPERATOR_EMPTY) {
        return i18n.t('is empty')
    }
    if (filter.operator === OPERATOR_NOT_EMPTY) {
        return i18n.t('is not empty')
    }
    switch (filter.type) {
        case FILTER_TEXT:
            return i18n.t('contains "{{- value}}"', { value: filter.value })
        case FILTER_NUMBER:
            return getNumberSummary(filter)
        case FILTER_OPTIONS:
            return getOptionsSummary(filter.values, formatValue)
        case FILTER_DATE:
            return getDateSummary(filter)
        default:
            return ''
    }
}
