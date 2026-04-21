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

        if (a.isLegendIsolated && !b.isLegendIsolated) {
            return 1
        }
        if (!a.isLegendIsolated && b.isLegendIsolated) {
            return -1
        }

        return bRange.start !== aRange.start
            ? bRange.start - aRange.start
            : bRange.end - aRange.end
    })

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

export const parseRange = (str) => {
    const [start, end] = str.split(' - ')
    return [parseWithSeparator(start), parseWithSeparator(end)]
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

    return sortBy('startValue', legendSet.legends).map(pickSome)
}

/* eslint-disable max-params */
export const getAutomaticLegendItems = (
    data,
    method = CLASSIFICATION_EQUAL_INTERVALS,
    classes = defaultClasses,
    colorScale = defaultColorScale,
    legendDecimalPlaces,
    legendIsolated
) => {
    if (data.length === 0) {
        return { items: [] }
    }

    const applyColor = (item, color) => ({
        ...item,
        color,
        ...(legendDecimalPlaces !== undefined && {
            decimalPlaces: legendDecimalPlaces,
        }),
    })

    const {
        value: isolatedValue,
        color: isolatedColor,
        name: isolatedName,
    } = legendIsolated ?? {}

    if (isolatedValue !== undefined) {
        const nonIsolatedData = data.filter((v) => v !== isolatedValue)
        const isolatedItem = applyColor(
            {
                startValue: isolatedValue,
                endValue: isolatedValue,
                isLegendIsolated: true,
                ...(isolatedName && { name: isolatedName }),
            },
            isolatedColor || colorScale[0]
        )

        if (nonIsolatedData.length === 0) {
            return { items: [isolatedItem] }
        }

        const cls = getLegendItems(nonIsolatedData, method, {
            numClasses: classes,
            precision: legendDecimalPlaces,
        })
        const colorOffset = isolatedColor ? 0 : 1
        return {
            items: [
                isolatedItem,
                ...cls.items.map((item, i) =>
                    applyColor(item, colorScale[colorOffset + i])
                ),
            ],
            valueFormat: cls.valueFormat,
        }
    }

    const cls = getLegendItems(data, method, {
        numClasses: classes,
        precision: legendDecimalPlaces,
    })
    return {
        items: cls.items.map((item, i) => applyColor(item, colorScale[i])),
        valueFormat: cls.valueFormat,
    }
}
/* eslint-enable max-params */

export const getRenderingLabel = (strategy) => {
    const map = {
        [RENDERING_STRATEGY_SPLIT_BY_PERIOD]: i18n.t('Split'),
        [RENDERING_STRATEGY_TIMELINE]: i18n.t('Timeline'),
    }
    return map[strategy] ? ' • ' + map[strategy] : null
}

const normalize = (str) => String(str).replaceAll(/[\s,]/g, '')

const nameContainsValue = (name, val) => {
    const normalizedName = normalize(name)
    const normalizedVal = normalize(val)
    return new RegExp(String.raw`(?<![\d.])${normalizedVal}(?![\d.])`).test(
        normalizedName
    )
}

const rangeInName = (name, startValue, endValue) =>
    (String(startValue) !== '' && nameContainsValue(name, startValue)) ||
    (String(endValue) !== '' && nameContainsValue(name, endValue))

export const legendNamesContainRange = (items) => {
    const numericItems = items.filter(
        ({ startValue, endValue }) =>
            !Number.isNaN(startValue) && !Number.isNaN(endValue)
    )

    if (!numericItems.length) {
        return false
    }

    const itemsWithRange = numericItems.filter(
        ({ name = '', startValue, endValue }) =>
            rangeInName(name, startValue, endValue)
    )

    return itemsWithRange.length / numericItems.length >= 0.5
}
