import { getInstance as getD2 } from 'd2/lib/d2';
import { curry } from 'lodash/fp';
import { getLegendItemForValue } from '../util/classify';
import {
    loadLegendSet,
    getAutomaticLegendItems,
    getPredefinedLegendItems,
} from '../util/legend';
import { EVENT_RADIUS, CLASSIFICATION_PREDEFINED } from '../constants/layers';

export const styleByDataItem = async (styleDataItem, config) => {
    // TODO: Support more numeric fields
    if (styleDataItem.valueType === 'INTEGER') {
        return styleByNumeric(styleDataItem, config);
    } else if (styleDataItem.optionSet) {
        return styleByOptionSet(styleDataItem, config);
    }

    return null; // Should never return here
};

export const styleByNumeric = async (styleDataItem, config) => {
    const { method, classes, colorScale, legendSet, eventPointRadius } = config;
    let name;
    let legendItems;

    if (method === CLASSIFICATION_PREDEFINED) {
        console.log('legendSet', legendSet);
        const legendSetFull = await loadLegendSet(legendSet);
        name = legendSetFull.name;
        legendItems = getPredefinedLegendItems(legendSetFull);
    } else {
        console.log('name', styleDataItem.name);
        name =
            styleDataItem.name || (await getDataElementName(styleDataItem.id));
    }

    return {
        getName() {
            return name;
        },
        getData(data) {
            if (method !== CLASSIFICATION_PREDEFINED) {
                const sortedValues = data
                    .map(feature =>
                        Number(feature.properties[styleDataItem.id])
                    )
                    .sort((a, b) => a - b);

                legendItems = getAutomaticLegendItems(
                    sortedValues,
                    method,
                    classes,
                    colorScale
                );
            }

            legendItems.forEach(item => {
                item.radius = eventPointRadius || EVENT_RADIUS;
                item.count = 0;
            });

            const getLegendItem = curry(getLegendItemForValue)(legendItems);

            return data.map(feature => {
                const value = Number(feature.properties[styleDataItem.id]);
                const legendItem = getLegendItem(value);

                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        value,
                        color: legendItem ? legendItem.color : null,
                    },
                };
            });
        },

        // Returns empty array if called before getData for automtic legends
        getLegendItems() {
            return legendItems || [];
        },
    };
};

export const styleByOptionSet = async (styleDataItem, config = {}) => {
    const id = styleDataItem.id;
    const optionSet = styleDataItem.optionSet;

    // True if optionSet is from a favorite
    // TODO: We should not modify styleDataItem directly
    if (!optionSet.name) {
        const fullOptionSet = await getOptionSet(optionSet.id);
        optionSet.name = fullOptionSet.name;
        styleDataItem.name = optionSet.name; // Used in popup

        optionSet.options = optionSet.options.map(option => ({
            ...fullOptionSet.options.find(opt => opt.id === option.id),
            ...option,
        }));
    }

    // For easier and faster lookup below
    const optionsByCode = optionSet.options.reduce((obj, option) => {
        obj[option.code] = option;
        return obj;
    }, {});

    return {
        getName() {
            return optionSet.name;
        },
        // Returns data features with value and color properties
        getData(data) {
            return data.map(feature => {
                const option = optionsByCode[feature.properties[id]];

                if (!option) {
                    return feature;
                }

                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        value: option.name,
                        color: option.style.color,
                    },
                };
            });
        },
        // Returns legend items
        getLegendItems() {
            return optionSet.options.map(option => ({
                name: option.name,
                color: option.style.color,
                radius: config.eventPointRadius || EVENT_RADIUS,
            }));
        },
    };
};

// TODO: Move to other file?
export const getOptionSet = async id => {
    const d2 = await getD2();
    return d2.models.optionSet.get(id, {
        fields:
            'displayName~rename(name),options[id,code,displayName~rename(name)]',
    });
};

export const getDataElementName = async id => {
    const d2 = await getD2();
    return d2.models.dataElement
        .get(id, {
            fields: 'displayName~rename(name)',
        })
        .then(model => model.name);
};
