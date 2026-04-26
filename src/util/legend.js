import {
    DIMENSION_TYPE_INDICATOR,
    DIMENSION_TYPE_DATA_ELEMENT,
    DIMENSION_TYPE_DATA_SET,
} from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { sortBy, pick } from 'lodash/fp'
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../constants/layers.js'
import { getLegendItems } from '../util/classify.js'
import { defaultClasses, defaultColorScale } from '../util/colors.js'
import { parseWithSeparator } from './numbers.js'

const INDICATOR_QUERY = {
    dimension: {
        resource: 'indicators',
        id: ({ id }) => id,
        params: {
            fields: 'legendSet[id,displayName~rename(name)]',
        },
    },
}

const DATA_ELEMENT_QUERY = {
    dimension: {
        resource: 'dataElements',
        id: ({ id }) => id,
        params: {
            fields: 'legendSet[id,displayName~rename(name)]',
        },
    },
}

const DATA_SET_QUERY = {
    dimension: {
        resource: 'dataSets',
        id: ({ id }) => id,
        params: {
            fields: 'legendSet[id,displayName~rename(name)]',
        },
    },
}

const getRange = (item) => {
    if ('from' in item) {
        return { start: item.from, end: item.to }
    }
    if ('startValue' in item) {
        return { start: item.startValue, end: item.endValue }
    }
    return null
}

export const sortLegendItems = (items) =>
    [...items].sort((a, b) => {
        const aRange = getRange(a)
        const bRange = getRange(b)

        if (!aRange && !bRange) {
            return 0
        }
        if (!aRange) {
            return 1
        }
        if (!bRange) {
            return -1
        }

        return bRange.start === aRange.start
            ? bRange.end - aRange.end
            : bRange.start - aRange.start
    })

export const parseRange = (str) => {
    const [start, end] = str.split(' - ')
    return [parseWithSeparator(start), parseWithSeparator(end)]
}

export const loadDataItemLegendSet = async (dataItem, engine) => {
    if (!dataItem) {
        return null
    }

    let result = null
    switch (dataItem.dimensionItemType) {
        case DIMENSION_TYPE_INDICATOR:
            {
                result = await engine.query(INDICATOR_QUERY, {
                    variables: { id: dataItem.id },
                })
            }
            break
        case DIMENSION_TYPE_DATA_ELEMENT:
            {
                result = await engine.query(DATA_ELEMENT_QUERY, {
                    variables: { id: dataItem.id },
                })
            }
            break
        case DIMENSION_TYPE_DATA_SET:
            {
                result = await engine.query(DATA_SET_QUERY, {
                    variables: { id: dataItem.id },
                })
            }
            break
        default:
            return null
    }

    return result.dimension.legendSet
}

export const formatLegendItems = (legendItems) => {
    const sortedItems = sortBy('startValue', legendItems)
    return sortedItems.map((item) => ({
        color: item.color,
        name: item.name,
        range: item.startValue + ' - ' + item.endValue,
    }))
}

export const getBinsFromLegendItems = (legendItems) => {
    const sortedItems = sortBy('startValue', legendItems)
    const lastItem = sortedItems[sortedItems.length - 1]
    const bins = sortedItems.map((item) => item.startValue)

    bins.push(lastItem.endValue)
    return bins
}

export const getColorScaleFromLegendItems = (legendItems) => {
    const sortedItems = sortBy('startValue', legendItems)
    return sortedItems.map((item) => item.color)
}

export const getLabelsFromLegendItems = (legendItems) => {
    const sortedItems = sortBy('startValue', legendItems)
    return sortedItems.map((item) => item.name)
}

// Returns a legend created from a pre-defined legend set
export const getPredefinedLegendItems = (legendSet) => {
    const pickSome = pick(['name', 'startValue', 'endValue', 'color'])

    return sortBy('startValue', legendSet.legends)
        .map(pickSome)
        .map((item) =>
            item.name === `${item.startValue} - ${item.endValue}`
                ? { ...item, name: '' } // Clear name if same as startValue - endValue
                : item
        )
}

export const getAutomaticLegendItems = ({
    data,
    method = CLASSIFICATION_EQUAL_INTERVALS,
    classes = defaultClasses,
    colorScale = defaultColorScale,
}) => {
    if (data.length === 0) {
        return { items: [] }
    }

    const classification = getLegendItems(data, method, classes)
    return {
        items: classification.items.map((item, index) => ({
            ...item,
            color: colorScale[index],
        })),
        valueFormat: classification.valueFormat,
    }
}

export const getRenderingLabel = (strategy) => {
    const map = {
        [RENDERING_STRATEGY_SPLIT_BY_PERIOD]: i18n.t('Split'),
        [RENDERING_STRATEGY_TIMELINE]: i18n.t('Timeline'),
    }
    return map[strategy] ? ' • ' + map[strategy] : null
}
