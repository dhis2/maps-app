import i18n from '@dhis2/d2-i18n'
import { curry } from 'lodash/fp'
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
        styleByDefault(config)
    }

    return config
}

const styleByDefault = async (config) => {
    const { styleDataItem, data, legend, eventPointColor, eventPointRadius } =
        config
    const { id } = styleDataItem

    config.data = data.map((feature) => {
        const value = feature.properties[id]

        return {
            ...feature,
            properties: {
                ...feature.properties,
                value: hasValue(value) ? value : i18n.t('Not set'),
                color: EVENT_COLOR,
            },
        }
    })

    legend.items = [
        {
            name: i18n.t('Not set'),
            color: cssColor(eventPointColor) || EVENT_COLOR,
            radius: eventPointRadius || EVENT_RADIUS,
            count: data.length,
        },
    ]

    return config
}

const styleByBoolean = async (config, engine) => {
    const { styleDataItem, data, legend, eventPointColor, eventPointRadius } =
        config
    const { id, name, values } = styleDataItem

    legend.unit =
        name ||
        (await engine
            .query(DATA_ELEMENT_NAME_QUERY, {
                variables: { id },
            })
            .then(({ dataElement }) => dataElement.name))

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

    legend.items.push({
        name: i18n.t('Not set'),
        color: cssColor(eventPointColor) || EVENT_COLOR,
        radius: eventPointRadius || EVENT_RADIUS,
        count: 0,
    })

    config.data = data.map((feature) => {
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
        } else {
            displayValue = hasValue(value) ? value : i18n.t('Not set')
            color = EVENT_COLOR
            legend.items[legend.items.length - 1].count++
        }

        return {
            ...feature,
            properties: {
                ...feature.properties,
                value: displayValue,
                color: color,
            },
        }
    })

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
        eventPointColor,
        eventPointRadius,
    } = config

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
        legend.unit =
            styleDataItem.name ||
            (await engine
                .query(DATA_ELEMENT_NAME_QUERY, {
                    variables: { id: styleDataItem.id },
                })
                .then(({ dataElement }) => dataElement.name))

        // Generate legend items based on layer config
        legend.items = getAutomaticLegendItems(
            sortedValues,
            method,
            classes,
            colorScale
        )
    }

    legend.items.push({
        name: i18n.t('Not set'),
        color: cssColor(eventPointColor) || EVENT_COLOR,
    })

    // Add radius and count to each legend item
    legend.items.forEach((item) => {
        item.radius = eventPointRadius || EVENT_RADIUS
        item.count = 0
    })

    // Helper function to get legend item for data value
    const getLegendItem = curry(getLegendItemForValue)(
        config.legend.items.slice(0, -1)
    )

    // Add style data value and color to each feature
    config.data = data.map((feature) => {
        const value = feature.properties[styleDataItem.id]

        let legendItem
        if (hasValue(value)) {
            const numericValue = Number(value)
            legendItem = getLegendItem(numericValue)
        }

        if (legendItem) {
            legendItem.count++
        } else {
            legend.items[legend.items.length - 1].count++
        }

        return {
            ...feature,
            properties: {
                ...feature.properties,
                value: hasValue(value) ? value : i18n.t('Not set'),
                color: legendItem ? legendItem.color : EVENT_COLOR,
            },
        }
    })

    return config
}

const styleByOptionSet = async (config, engine) => {
    const { styleDataItem, legend, eventPointColor, eventPointRadius } = config
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

    legend.items.push({
        name: i18n.t('Not set'),
        color: cssColor(eventPointColor) || EVENT_COLOR,
        radius: eventPointRadius || EVENT_RADIUS,
        count: 0,
    })

    // For easier and faster lookup below
    // TODO: There might be options with duplicate name, so code/id would be safer
    // If we use code/id we also need to retrive name to show in popup/data table/download
    const optionsByName = optionSet.options.reduce((obj, option) => {
        obj[option.name.toLowerCase()] = option
        return obj
    }, {})

    // Add style data value and color to each feature
    config.data = config.data.map((feature) => {
        const name = feature.properties[id]

        if (name) {
            const option = optionsByName[name.toLowerCase()]

            if (option) {
                const optionIndex = legend.items.findIndex(
                    (item) => item.name === option.name
                )
                legend.items[optionIndex].count++
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        value: option.name,
                        color: option.style.color,
                    },
                }
            }
        }

        legend.items[legend.items.length - 1].count++
        return {
            ...feature,
            properties: {
                ...feature.properties,
                value: hasValue(name) ? name : i18n.t('Not set'),
                color: EVENT_COLOR,
            },
        }
    })

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
