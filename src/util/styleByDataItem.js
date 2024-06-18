import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { curry } from 'lodash/fp'
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    CLASSIFICATION_PREDEFINED,
} from '../constants/layers.js'
import { numberValueTypes } from '../constants/valueTypes.js'
import { cssColor } from '../util/colors.js'
import { OPTION_SET_QUERY, LEGEND_SET_QUERY } from '../util/requests.js'
import { getLegendItemForValue } from './classify.js'
import { getAutomaticLegendItems, getPredefinedLegendItems } from './legend.js'

// "Style by data item" handling for event layer
// Can be reused for TEI layer when the Web API is improved
// This function is modifiyng the config object before it's added to the redux store
export const styleByDataItem = async (config, engine) => {
    const { styleDataItem } = config

    if (styleDataItem.optionSet) {
        await styleByOptionSet(config, engine)
    } else if (numberValueTypes.includes(styleDataItem.valueType)) {
        await styleByNumeric(config, engine)
    } else if (styleDataItem.valueType === 'BOOLEAN') {
        await styleByBoolean(config)
    }

    config.legend.items.push({
        name: i18n.t('Not set'),
        color: cssColor(config.eventPointColor) || EVENT_COLOR,
        radius: config.eventPointRadius || EVENT_RADIUS,
    })

    return config
}

export const styleByBoolean = async (config) => {
    const { styleDataItem, data, legend, eventPointRadius } = config
    const { id, name, values } = styleDataItem

    config.data = data.map((feature) => {
        const value = feature.properties[id] || '0'

        if (!value) {
            return feature
        }

        return {
            ...feature,
            properties: {
                ...feature.properties,
                value: value === '1' ? i18n.t('Yes') : i18n.t('No'),
                color: value === '1' ? values.true : values.false,
            },
        }
    })

    legend.unit = name || (await getDataElementName(id))

    legend.items = [
        {
            name: i18n.t('Yes'),
            color: values.true,
            radius: eventPointRadius || EVENT_RADIUS,
        },
    ]

    if (values.false) {
        legend.items.push({
            name: i18n.t('No'),
            color: values.false,
            radius: eventPointRadius || EVENT_RADIUS,
        })
    }

    return config
}

export const styleByNumeric = async (config, engine) => {
    const {
        styleDataItem,
        method,
        classes,
        colorScale,
        eventPointRadius,
        data,
    } = config

    // If legend set
    if (method === CLASSIFICATION_PREDEFINED) {
        // Load legend set from server
        const { legendSet } = await engine.query(LEGEND_SET_QUERY, {
            variables: { id: config.legendSet.id },
        })

        // Use legend set name and legend unit
        config.legend.unit = legendSet.name

        // Generate legend items from legendSet
        config.legend.items = getPredefinedLegendItems(legendSet)
    } else {
        // Create array of sorted values needed for classification
        const sortedValues = data
            .map((feature) => Number(feature.properties[styleDataItem.id]))
            .sort((a, b) => a - b)

        // Use data item name as legend unit (load from server if needed)
        config.legend.unit =
            styleDataItem.name || (await getDataElementName(styleDataItem.id))

        // Generate legend items based on layer config
        config.legend.items = getAutomaticLegendItems(
            sortedValues,
            method,
            classes,
            colorScale
        )
    }

    // Add radius and count to each legend item
    config.legend.items.forEach((item) => {
        item.radius = eventPointRadius || EVENT_RADIUS
        item.count = 0
    })

    // Helper function to get legend item for data value
    const getLegendItem = curry(getLegendItemForValue)(config.legend.items)

    // Add style data value and color to each feature
    config.data = config.data.map((feature) => {
        const value = Number(feature.properties[styleDataItem.id])
        const legendItem = getLegendItem(value)

        if (legendItem) {
            legendItem.count++
        }

        return {
            ...feature,
            properties: {
                ...feature.properties,
                value,
                color: legendItem ? legendItem.color : null,
            },
        }
    })

    return config
}

export const styleByOptionSet = async (config, engine) => {
    const { styleDataItem } = config
    const optionSet = await getOptionSet(styleDataItem.optionSet, engine)
    const id = styleDataItem.id

    // Replace styleDataItem with a version with names
    config.styleDataItem = {
        ...styleDataItem,
        name: optionSet.name,
        optionSet,
    }

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

        return feature
    })

    // Add legend data
    config.legend.unit = optionSet.name
    config.legend.items = optionSet.options.map((option) => ({
        name: option.name,
        color: option.style.color,
        radius: config.eventPointRadius || EVENT_RADIUS,
    }))

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

const getDataElementName = async (id) => {
    const d2 = await getD2()
    return d2.models.dataElement
        .get(id, {
            fields: 'displayName~rename(name)',
        })
        .then((model) => model.name)
}
