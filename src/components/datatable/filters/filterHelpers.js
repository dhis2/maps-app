import i18n from '@dhis2/d2-i18n'

export const getNumberOperators = () => [
    { value: 'eq', label: i18n.t('Equal to'), symbol: '=' },
    { value: 'neq', label: i18n.t('Not equal to'), symbol: '≠' },
    { value: 'gt', label: i18n.t('Greater than'), symbol: '>' },
    { value: 'gte', label: i18n.t('Greater than or equal to'), symbol: '≥' },
    { value: 'lt', label: i18n.t('Less than'), symbol: '<' },
    { value: 'lte', label: i18n.t('Less than or equal to'), symbol: '≤' },
    { value: 'between', label: i18n.t('Between'), symbol: '–' },
]

const isBlank = (v) => v === undefined || v === null || String(v).trim() === ''

// A draft that would not filter anything is treated as "no filter"
export const isEmptyFilter = (filter) => {
    if (!filter) {
        return true
    }
    switch (filter.type) {
        case 'text':
            return isBlank(filter.value)
        case 'number':
            return (
                isBlank(filter.value) &&
                (filter.operator !== 'between' || isBlank(filter.value2))
            )
        case 'options':
            return !filter.values?.length
        case 'date':
            return !filter.from && !filter.to
        default:
            return true
    }
}

// "Between" needs both bounds before it can be applied
const isIncompleteFilter = (filter) =>
    filter?.type === 'number' &&
    filter.operator === 'between' &&
    isBlank(filter.value) !== isBlank(filter.value2)

// Range errors shown inline on the second input
export const getFilterError = (filter) => {
    if (
        filter?.type === 'number' &&
        filter.operator === 'between' &&
        !isBlank(filter.value) &&
        !isBlank(filter.value2) &&
        Number(filter.value) > Number(filter.value2)
    ) {
        return i18n.t('Max must be greater than Min')
    }
    if (
        filter?.type === 'date' &&
        filter.from &&
        filter.to &&
        filter.from > filter.to
    ) {
        return i18n.t('To must be after From')
    }
    return null
}

export const isValidFilter = (filter) =>
    !isIncompleteFilter(filter) && !getFilterError(filter)

// Canonical form so that equivalent drafts compare equal
const normalizeFilter = (filter) => {
    if (typeof filter === 'string') {
        return filter
    }
    if (isEmptyFilter(filter)) {
        return null
    }
    switch (filter.type) {
        case 'number':
            return {
                type: 'number',
                operator: filter.operator,
                value: String(filter.value),
                value2:
                    filter.operator === 'between'
                        ? String(filter.value2)
                        : undefined,
            }
        case 'options':
            return { type: 'options', values: [...filter.values].sort() }
        case 'date':
            return {
                type: 'date',
                from: filter.from || undefined,
                to: filter.to || undefined,
            }
        default:
            return { type: filter.type, value: filter.value }
    }
}

export const isSameFilter = (a, b) =>
    JSON.stringify(normalizeFilter(a)) === JSON.stringify(normalizeFilter(b))

export const getEmptyOptionLabel = () => i18n.t('(No value)')

const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

// Short human readable summary used in the active filter chips
export const getFilterSummary = (filter) => {
    if (typeof filter === 'string') {
        return filter
    }
    switch (filter.type) {
        case 'text':
            return i18n.t('contains "{{- value}}"', { value: filter.value })
        case 'number': {
            if (filter.operator === 'between') {
                return `${filter.value} – ${filter.value2}`
            }
            const op = getNumberOperators().find(
                (o) => o.value === filter.operator
            )
            return `${op?.symbol} ${filter.value}`
        }
        case 'options': {
            const labels = filter.values.map((v) => v || getEmptyOptionLabel())
            return labels.length > 2
                ? i18n.t('{{first}}, {{second}} +{{count}}', {
                      first: labels[0],
                      second: labels[1],
                      count: labels.length - 2,
                  })
                : labels.join(', ')
        }
        case 'date':
            if (filter.from && filter.to) {
                return `${formatDate(filter.from)} – ${formatDate(filter.to)}`
            }
            return filter.from
                ? i18n.t('from {{date}}', { date: formatDate(filter.from) })
                : i18n.t('until {{date}}', { date: formatDate(filter.to) })
        default:
            return ''
    }
}
