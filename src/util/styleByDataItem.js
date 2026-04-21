import i18n from '@dhis2/d2-i18n'
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    CLASSIFICATION_PREDEFINED,
} from '../constants/layers.js'
import { numberValueTypes, booleanValueTypes } from '../constants/valueTypes.js'
import { cssColor } from '../util/colors.js'
import { OPTION_SET_QUERY, LEGEND_SET_QUERY } from '../util/requests.js'
import { getLegendItemForValue } from './classify.js'
import { getAutomaticLegendItems, getPredefinedLegendItems } from './legend.js'

const hasValue = (value) =>
    value !== undefined && value !== null && value !== ''

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
    const { styleDataItem, data, legend, eventPointColor, eventPointRadius } =
        config
    const { id } = styleDataItem

    legend.unit = await getLegendUnit(engine, styleDataItem)

    legend.items = [
        {
            name: i18n.t('Event'),
            color: cssColor(eventPointColor) || EVENT_COLOR,
            radius: eventPointRadius || EVENT_RADIUS,
            count: data.length,
        },
    ]

    config.data = data.map((feature) => {
        const value = feature.properties[id]

        return {
            ...feature,
            properties: {
                ...feature.properties,
                value: hasValue(value) ? value : i18n.t('Not set'),
                color: cssColor(eventPointColor) || EVENT_COLOR,
            },
        }
    })

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

    legend.items = [
        {
            name: i18n.t('Yes'),
            color: values.true,
            radius: eventPointRadius || EVENT_RADIUS,
            count: 0,
        },
    ]

    if (values.false) {
        legend.items.push({
            name: i18n.t('No'),
            color: values.false,
            radius: eventPointRadius || EVENT_RADIUS,
            count: 0,
        })
    }

    if (unclassifiedLegend) {
        legend.items.push({
            name: unclassifiedLegend.name || i18n.t('Unclassified'),
            color: unclassifiedLegend.color,
            radius: eventPointRadius || EVENT_RADIUS,
            count: 0,
            unclassified: true,
        })
    }

    if (noDataLegend) {
        legend.items.push({
            name: noDataLegend.name || i18n.t('No data'),
            color: noDataLegend.color,
            radius: eventPointRadius || EVENT_RADIUS,
            count: 0,
            noData: true,
        })
    }

    const noDataItem = legend.items.find((i) => i.noData)
    const unclassifiedItem = legend.items.find((i) => i.unclassified)

    config.data = data.reduce((acc, feature) => {
        const value = feature.properties[id]
        let displayValue
        let color

        if (value === '1') {
            displayValue = i18n.t('Yes')
            color = values.true
            legend.items[0].count++
        } else if (value === '0') {
            displayValue = i18n.t('No')
            color = values.false
            legend.items[1].count++
        } else if (!hasValue(value)) {
            if (!noDataItem) {
                return acc
            }
            displayValue = i18n.t('Not set')
            color = noDataLegend.color
            noDataItem.count++
        } else {
            if (!unclassifiedItem) {
                return acc
            }
            displayValue = value
            color = unclassifiedLegend.color
            unclassifiedItem.count++
        }

        acc.push({
            ...feature,
            properties: {
                ...feature.properties,
                value: displayValue,
                color: color,
            },
        })

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
        legendDecimalPlaces,
        legendIsolated,
        eventPointRadius,
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
            .filter((value) => !Number.isNaN(value))
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

    if (unclassifiedLegend) {
        legend.items.push({
            name: unclassifiedLegend.name || i18n.t('Unclassified'),
            color: unclassifiedLegend.color,
            unclassified: true,
        })
    }

    if (noDataLegend) {
        legend.items.push({
            name: noDataLegend.name || i18n.t('No data'),
            color: noDataLegend.color,
            noData: true,
        })
    }

    // Add radius and count to each legend item
    legend.items.forEach((item) => {
        item.radius = eventPointRadius || EVENT_RADIUS
        item.count = 0
    })

    const noDataItem = legend.items.find((i) => i.noData)
    const unclassifiedItem = legend.items.find((i) => i.unclassified)

    // Helper function to get legend item for data value
    // Exclude no-data and unclassified items from classification lookup
    const classificationItems = legend.items.filter(
        (i) => !i.noData && !i.unclassified
    )
    const getLegendItem = (value, method) =>
        getLegendItemForValue({
            value,
            valueFormat,
            method,
            legendItems: classificationItems,
        })

    // Add style data value and color to each feature
    config.data = data.reduce((acc, feature) => {
        const value = feature.properties[styleDataItem.id]

        if (!hasValue(value)) {
            if (!noDataItem) {
                return acc
            }
            noDataItem.count++
            acc.push({
                ...feature,
                properties: {
                    ...feature.properties,
                    value: i18n.t('Not set'),
                    color: noDataLegend.color,
                },
            })
            return acc
        }

        const numericValue = Number(value)
        const legendItem = getLegendItem(numericValue, method)

        if (legendItem) {
            legendItem.count++
        } else {
            if (!unclassifiedItem) {
                return acc
            }
            unclassifiedItem.count++
        }

        acc.push({
            ...feature,
            properties: {
                ...feature.properties,
                value,
                color: legendItem ? legendItem.color : unclassifiedLegend.color,
            },
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
        radius: eventPointRadius || EVENT_RADIUS,
        count: 0,
    }))

    if (unclassifiedLegend) {
        legend.items.push({
            name: unclassifiedLegend.name || i18n.t('Unclassified'),
            color: unclassifiedLegend.color,
            radius: eventPointRadius || EVENT_RADIUS,
            count: 0,
            unclassified: true,
        })
    }

    if (noDataLegend) {
        legend.items.push({
            name: noDataLegend.name || i18n.t('No data'),
            color: noDataLegend.color,
            radius: eventPointRadius || EVENT_RADIUS,
            count: 0,
            noData: true,
        })
    }

    const noDataItem = legend.items.find((i) => i.noData)
    const unclassifiedItem = legend.items.find((i) => i.unclassified)

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

        if (!hasValue(name)) {
            if (!noDataItem) {
                return acc
            }
            noDataItem.count++
            acc.push({
                ...feature,
                properties: {
                    ...feature.properties,
                    value: i18n.t('Not set'),
                    color: noDataLegend.color,
                },
            })
            return acc
        }

        const option = optionsByName[name.toLowerCase()]

        if (option) {
            const optionIndex = legend.items.findIndex(
                (item) => item.name === option.name
            )
            legend.items[optionIndex].count++
            acc.push({
                ...feature,
                properties: {
                    ...feature.properties,
                    value: option.name,
                    color: option.style.color,
                },
            })
        } else {
            if (!unclassifiedItem) {
                return acc
            }
            unclassifiedItem.count++
            acc.push({
                ...feature,
                properties: {
                    ...feature.properties,
                    value: name,
                    color: unclassifiedLegend.color,
                },
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
