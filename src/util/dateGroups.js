import { TYPE_DATETIME, TYPE_TIME } from '../constants/dataTable.js'
import { formatDate, formatDatetime } from './helpers.js'
import { dateLocale } from './time.js'

export {
    getNodeCheckState,
    flattenVisibleNodes,
    getSearchMatches,
    nodeMatchesOrHasMatch,
    togglePrefix as toggleDateGroupPrefix,
} from './prefixTree.js'

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:([T ])(\d{2}))?/
const TIME_KEY_PATTERN = /^(\d{2}):/

export const parseDateGroupKey = (rawValue, granularity) => {
    const str = String(rawValue)

    if (granularity === TYPE_TIME) {
        const match = TIME_KEY_PATTERN.exec(str)
        return match ? { hour: match[1] } : null
    }

    const match = DATE_KEY_PATTERN.exec(str)
    if (!match) {
        return null
    }
    const [, year, month, day, delimiter, hour] = match
    return {
        year,
        month: `${year}-${month}`,
        day: `${year}-${month}-${day}`,
        hour:
            granularity === TYPE_DATETIME && delimiter && hour
                ? `${year}-${month}-${day}${delimiter}${hour}`
                : null,
    }
}

const getOrCreateNode = (childMap, { key, level, label }) => {
    let node = childMap.get(key)
    if (!node) {
        node = { key, level, label, prefix: key, childMap: new Map() }
        childMap.set(key, node)
    }
    return node
}

const sortedNodes = (childMap) =>
    Array.from(childMap.values()).map((node) => ({
        key: node.key,
        level: node.level,
        label: node.label,
        prefix: node.prefix,
        children: sortedNodes(node.childMap),
    }))

const getValueFormatter = (granularity) =>
    granularity === TYPE_DATETIME || granularity === TYPE_TIME
        ? formatDatetime
        : formatDate

export const buildDateGroupTree = (values, granularity) => {
    const rootMap = new Map()
    const unparseable = []
    const formatValue = getValueFormatter(granularity)

    values.forEach((value) => {
        const parsed = parseDateGroupKey(value, granularity)
        if (!parsed) {
            unparseable.push(value)
            return
        }

        if (granularity === TYPE_TIME) {
            const hourNode = getOrCreateNode(rootMap, {
                key: parsed.hour,
                level: 'hour',
            })
            getOrCreateNode(hourNode.childMap, {
                key: value,
                level: 'value',
                label: formatValue(value),
            })
            return
        }

        const yearNode = getOrCreateNode(rootMap, {
            key: parsed.year,
            level: 'year',
        })
        const monthNode = getOrCreateNode(yearNode.childMap, {
            key: parsed.month,
            level: 'month',
        })
        const dayNode = getOrCreateNode(monthNode.childMap, {
            key: parsed.day,
            level: 'day',
        })
        const valueParentNode = parsed.hour
            ? getOrCreateNode(dayNode.childMap, {
                  key: parsed.hour,
                  level: 'hour',
              })
            : dayNode
        getOrCreateNode(valueParentNode.childMap, {
            key: value,
            level: 'value',
            label: formatValue(value),
        })
    })

    const tree = sortedNodes(rootMap)
    const leaves = unparseable.map((value) => ({
        key: value,
        level: 'leaf',
        label: value,
        prefix: value,
        children: [],
    }))

    return [...tree, ...leaves]
}

const getHourLabel = (key) => {
    const match = key.match(/(\d{2})$/)
    return match ? `${match[1]}:00` : key
}

export const formatNodeLabel = (node, locale) => {
    const bcp47Locale = dateLocale(locale)
    switch (node.level) {
        case 'year':
            return node.key
        case 'month': {
            const [, month] = node.key.split('-').map(Number)
            return new Intl.DateTimeFormat(bcp47Locale, {
                month: 'long',
            }).format(new Date(2000, month - 1, 1))
        }
        case 'day': {
            const [year, month, day] = node.key.split('-').map(Number)
            const date = new Date(year, month - 1, day)
            const weekday = new Intl.DateTimeFormat(bcp47Locale, {
                weekday: 'long',
            }).format(date)
            const dayNumber = String(date.getDate()).padStart(2, '0')
            return `${dayNumber} ${weekday}`
        }
        case 'hour':
            return getHourLabel(node.key)
        case 'value':
        case 'leaf':
            return node.label ?? node.key
        default:
            return node.key
    }
}
