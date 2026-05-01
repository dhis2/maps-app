import i18n from '@dhis2/d2-i18n'
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_STANDARD_DEVIATION,
} from '../constants/layers.js'
import { numberValueTypes, booleanValueTypes } from '../constants/valueTypes.js'
import { cssColor } from '../util/colors.js'
import { OPTION_SET_QUERY, LEGEND_SET_QUERY } from '../util/requests.js'
import { getLegendItemForValue } from './classify.js'
import { getAutomaticLegendItems, getPredefinedLegendItems } from './legend.js'

const hasValue = (value) =>
    value !== undefined && value !== null && value !== ''

const addSpecialLegendItems = (
    legend,
    { noDataLegend, unclassifiedLegend }
) => {
    if (unclassifiedLegend) {
        legend.items.push({
            name: unclassifiedLegend.name || i18n.t('Unclassified'),
            color: unclassifiedLegend.color,
            isUnclassified: true,
        })
    }
    if (noDataLegend) {
        legend.items.push({
            name: noDataLegend.name || i18n.t('No data'),
            color: noDataLegend.color,
            isNoData: true,
        })
    }
    return {
        unclassifiedLegendItem: legend.items.find(
            (i) => i.isUnclassified === true
        ),
        noDataLegendItem: legend.items.find((i) => i.isNoData === true),
    }
}

const stampLegendItems = (items, eventPointRadius) =>
    items.forEach((item) => {
        item.radius = eventPointRadius || EVENT_RADIUS
        item.count = 0
    })

const addFeature = (acc, feature, { item, value }) => {
    item.count++
    acc.push({
        ...feature,
        properties: {
            ...feature.properties,
            value,
            color: item.color,
        },
    })
}

// "Style by data item" handling for event layer
// Can be reused for TEI layer when the Web API is improved
// This function is modifiyng the config object before it's added to the redux store
export const styleByDataItem = async (config, engine) => {
    const { styleDataItem } = config
    if (styleDataItem.optionSet) {
        await styleByOptionSet(config, engine)
    } else if (numberValueTypes.includes(styleDataItem.valueType)) {
        await styleByNumeric(config, engine)
    } else if (booleanValueTypes.includes(styleDataItem.valueType)) {
        await styleByBoolean(config, engine)
    } else {
        await styleByDefault(config, engine)
    }

    return config
}

const styleByDefault = async (config, engine) => {
    const {
        styleDataItem,
        data,
        legend,
        eventPointColor,
        eventPointRadius,
        noDataLegend,
    } = config
    const { id } = styleDataItem

    legend.unit = await getLegendUnit(engine, styleDataItem)

    const eventItem = {
        name: i18n.t('Event'),
        color: cssColor(eventPointColor) || EVENT_COLOR,
    }
    legend.items = [eventItem]

    const { noDataLegendItem } = addSpecialLegendItems(legend, { noDataLegend })
    stampLegendItems(legend.items, eventPointRadius)

    config.data = data.reduce((acc, feature) => {
        const value = feature.properties[id]
        const isNoData = !hasValue(value)

        if (isNoData && !noDataLegendItem) {
            return acc
        }

        addFeature(acc, feature, {
            item: isNoData ? noDataLegendItem : eventItem,
            value: isNoData ? i18n.t('Not set') : value,
        })
        return acc
    }, [])

    return config
}

const styleByBoolean = async (config, engine) => {
    const {
        styleDataItem,
        data,
        legend,
        eventPointRadius,
        noDataLegend,
        unclassifiedLegend,
    } = config
    const { id, values } = styleDataItem

    legend.unit = await getLegendUnit(engine, styleDataItem)

    const yesItem = { name: i18n.t('Yes'), color: values.true }
    const noItem = values.false
        ? { name: i18n.t('No'), color: values.false }
        : null

    legend.items = [yesItem, noItem].filter(Boolean)

    const { unclassifiedLegendItem, noDataLegendItem } = addSpecialLegendItems(
        legend,
        { noDataLegend, unclassifiedLegend }
    )
    stampLegendItems(legend.items, eventPointRadius)

    config.data = data.reduce((acc, feature) => {
        const value = feature.properties[id]
        const isNoData = !hasValue(value)
        const isUnclassified = !isNoData && value !== '1' && value !== '0'

        if (isUnclassified && !unclassifiedLegendItem) {
            return acc
        }
        if (isNoData && !noDataLegendItem) {
            return acc
        }

        if (value === '1') {
            addFeature(acc, feature, { item: yesItem, value: i18n.t('Yes') })
        } else if (value === '0' && noItem) {
            addFeature(acc, feature, { item: noItem, value: i18n.t('No') })
        } else if (isUnclassified) {
            addFeature(acc, feature, { item: unclassifiedLegendItem, value })
        } else {
            addFeature(acc, feature, {
                item: noDataLegendItem,
                value: i18n.t('Not set'),
            })
        }
        return acc
    }, [])

    return config
}

const styleByNumeric = async (config, engine) => {
    const {
        styleDataItem,
        data,
        legend,
        method,
        classes,
        colorScale,
        eventPointRadius,
        legendDecimalPlaces,
        legendIsolated,
        noDataLegend,
        unclassifiedLegend,
    } = config
    let valueFormat

    // If legend set
    if (method === CLASSIFICATION_PREDEFINED) {
        // Load legend set from server
        const { legendSet } = await engine.query(LEGEND_SET_QUERY, {
            variables: { id: config.legendSet.id },
        })

        // Use legend set name and legend unit
        legend.unit = legendSet.name

        // Generate legend items from legendSet
        legend.items = getPredefinedLegendItems(legendSet)
    } else {
        // Create array of sorted values needed for classification
        const sortedValues = data
            .map((feature) => feature.properties[styleDataItem.id])
            .filter(hasValue)
            .map(Number)
            .filter((value) => !isNaN(value))
            .sort((a, b) => a - b)

        // Use data item name as legend unit (load from server if needed)
        legend.unit = await getLegendUnit(engine, styleDataItem)

        // Generate legend items based on layer config
        const classification = getAutomaticLegendItems({
            data: sortedValues,
            method,
            classes,
            colorScale,
            legendDecimalPlaces,
            legendIsolated,
        })
        legend.items = classification.items
        valueFormat = classification.valueFormat
    }

    const { unclassifiedLegendItem, noDataLegendItem } = addSpecialLegendItems(
        legend,
        { noDataLegend, unclassifiedLegend }
    )
    stampLegendItems(legend.items, eventPointRadius)

    // Helper function to get legend item for data value
    const getLegendItem = (value) =>
        getLegendItemForValue({
            value,
            valueFormat,
            method,
            legendItems: legend.items,
            clamp:
                method !== CLASSIFICATION_PREDEFINED &&
                method !== CLASSIFICATION_LOGARITHMIC &&
                method !== CLASSIFICATION_STANDARD_DEVIATION,
        })

    // Add style data value and color to each feature
    config.data = data.reduce((acc, feature) => {
        const value = feature.properties[styleDataItem.id]

        let legendItem
        if (hasValue(value)) {
            const numericValue = Number(value)
            legendItem = getLegendItem(numericValue)
        }

        const isNoData = !hasValue(value)
        const isUnclassified = hasValue(value) && !legendItem

        if (isUnclassified && !unclassifiedLegendItem) {
            return acc
        }
        if (isNoData && !noDataLegendItem) {
            return acc
        }

        const activeItem =
            legendItem ??
            (isUnclassified ? unclassifiedLegendItem : noDataLegendItem)

        addFeature(acc, feature, {
            item: activeItem,
            value: hasValue(value) ? value : i18n.t('Not set'),
        })
        return acc
    }, [])

    return config
}

const styleByOptionSet = async (config, engine) => {
    const {
        styleDataItem,
        legend,
        eventPointRadius,
        noDataLegend,
        unclassifiedLegend,
    } = config
    const optionSet = await getOptionSet(styleDataItem.optionSet, engine)
    const id = styleDataItem.id

    // Replace styleDataItem with a version with names
    config.styleDataItem = {
        ...styleDataItem,
        name: optionSet.name,
        optionSet,
    }

    // Add legend data
    legend.unit = optionSet.name
    legend.items = optionSet.options.map((option) => ({
        name: option.name,
        color: option.style.color,
    }))

    const { unclassifiedLegendItem, noDataLegendItem } = addSpecialLegendItems(
        legend,
        { noDataLegend, unclassifiedLegend }
    )
    stampLegendItems(legend.items, eventPointRadius)

    // For easier and faster lookup below
    // TODO: There might be options with duplicate name, so code/id would be safer
    // If we use code/id we also need to retrive name to show in popup/data table/download
    const optionsByName = optionSet.options.reduce((obj, option) => {
        obj[option.name.toLowerCase()] = option
        return obj
    }, {})

    // Add style data value and color to each feature
    config.data = config.data.reduce((acc, feature) => {
        const name = feature.properties[id]
        const isNoData = !hasValue(name)
        const option = isNoData ? null : optionsByName[name.toLowerCase()]
        const isUnclassified = !isNoData && !option

        if (isUnclassified && !unclassifiedLegendItem) {
            return acc
        }
        if (isNoData && !noDataLegendItem) {
            return acc
        }

        if (option) {
            addFeature(acc, feature, {
                item: legend.items.find((i) => i.name === option.name),
                value: option.name,
            })
        } else if (isUnclassified) {
            addFeature(acc, feature, {
                item: unclassifiedLegendItem,
                value: name,
            })
        } else {
            addFeature(acc, feature, {
                item: noDataLegendItem,
                value: i18n.t('Not set'),
            })
        }
        return acc
    }, [])

    return config
}

// The style option set included in a favorite is stripped for names
// and this function add the names if needed
const getOptionSet = async (optionSet, engine) => {
    // Return unmodified option set if names are included
    if (optionSet.name) {
        return optionSet
    }

    // Load option set from server
    const { optionSet: optSet } = await engine.query(OPTION_SET_QUERY, {
        variables: { id: optionSet.id },
    })

    // Return modified option set with names and codes
    return {
        ...optionSet,
        name: optSet.name,
        options: optionSet.options.map((option) => ({
            ...optSet.options.find((opt) => opt.id === option.id),
            ...option,
        })),
    }
}

const DATA_ELEMENT_NAME_QUERY = {
    dataElement: {
        resource: 'dataElements',
        id: ({ id }) => id,
        params: {
            fields: 'displayName~rename(name)',
        },
    },
}

const ATTRIBUTE_NAME_QUERY = {
    trackedEntityAttribute: {
        resource: 'trackedEntityAttributes',
        id: ({ id }) => id,
        params: {
            fields: 'displayName~rename(name)',
        },
    },
}

const getLegendUnit = async (engine, styleDataItem) => {
    if (styleDataItem.name) {
        return styleDataItem.name
    }

    try {
        const { dataElement } = await engine.query(DATA_ELEMENT_NAME_QUERY, {
            variables: { id: styleDataItem.id },
        })
        return dataElement.name
    } catch {
        const { trackedEntityAttribute } = await engine.query(
            ATTRIBUTE_NAME_QUERY,
            {
                variables: { id: styleDataItem.id },
            }
        )
        return trackedEntityAttribute.name
    }
}
