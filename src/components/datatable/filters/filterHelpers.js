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
                isBlank(filter.value) ||
                (filter.operator === 'between' && isBlank(filter.value2))
            )
        case 'options':
            return !filter.values?.length
        case 'date':
            return !filter.from && !filter.to
        default:
            return true
    }
}

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

const toIsoDate = (date) => {
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}`
}

export const getDatePresets = () => {
    const today = new Date()
    const daysAgo = (n) => {
        const d = new Date(today)
        d.setDate(d.getDate() - n)
        return toIsoDate(d)
    }
    return [
        {
            id: 'last7',
            label: i18n.t('Last 7 days'),
            from: daysAgo(6),
            to: toIsoDate(today),
        },
        {
            id: 'last30',
            label: i18n.t('Last 30 days'),
            from: daysAgo(29),
            to: toIsoDate(today),
        },
        {
            id: 'thisYear',
            label: i18n.t('This year'),
            from: `${today.getFullYear()}-01-01`,
            to: toIsoDate(today),
        },
        {
            id: 'lastYear',
            label: i18n.t('Last year'),
            from: `${today.getFullYear() - 1}-01-01`,
            to: `${today.getFullYear() - 1}-12-31`,
        },
    ]
}
