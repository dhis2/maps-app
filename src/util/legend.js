import { getInstance as getD2 } from 'd2'
import { sortBy, pick } from 'lodash/fp'
import { CLASSIFICATION_EQUAL_INTERVALS } from '../constants/layers.js'
import { getLegendItems } from '../util/classify.js'
import { defaultClasses, defaultColorScale } from '../util/colors.js'

export const loadLegendSet = async (legendSet) => {
    const d2 = await getD2()
    return d2.models.legendSet.get(legendSet.id) // TODO: Restrict loading fields
}

export const loadDataItemLegendSet = async (dataItem) => {
    const type = (dataItem.dimensionItemType || '').toLowerCase()
    const d2 = await getD2()

    if (!type || !d2.models[type]) {
        return
    }

    return d2.models[type]
        .get(dataItem.id, {
            fields: 'legendSet[id,displayName~rename(name)]',
        })
        .then((model) => model.legendSet)
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
