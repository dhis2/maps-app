import {
    DIMENSION_TYPE_INDICATOR,
    DIMENSION_TYPE_DATA_ELEMENT,
    DIMENSION_TYPE_DATA_SET,
} from '@dhis2/analytics'
import { sortBy, pick } from 'lodash/fp'
import { CLASSIFICATION_EQUAL_INTERVALS } from '../constants/layers.js'
import { getLegendItems } from '../util/classify.js'
import { defaultClasses, defaultColorScale } from '../util/colors.js'

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

export const sortLegendItems = (items) =>
    items.sort((a, b) => {
        if ('from' in a) {
            return b.from - a.from
        }
        if ('startValue' in a) {
            return b.startValue - a.startValue
        }
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

/* eslint-disable max-params */
export const getAutomaticLegendItems = (
    data,
    method = CLASSIFICATION_EQUAL_INTERVALS,
    classes = defaultClasses,
    colorScale = defaultColorScale
) => {
    const items = data.length ? getLegendItems(data, method, classes) : []

    return items.map((item, index) => ({
        ...item,
        color: colorScale[index],
    }))
}
/* eslint-enable max-params */
