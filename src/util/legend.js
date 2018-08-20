import { getInstance as getD2 } from 'd2/lib/d2';
import { sortBy } from 'lodash/fp';
import { pick } from 'lodash/fp';
import { getLegendItems } from '../util/classify';
import { defaultClasses, defaultColorScale } from '../util/colorscale';
import { CLASSIFICATION_EQUAL_INTERVALS } from '../constants/layers';

export const loadLegendSet = async legendSet => {
    const d2 = await getD2();
    return d2.models.legendSet.get(legendSet.id);
};

export const loadDataItemLegendSet = async dataItem => {
    const type = (dataItem.dimensionItemType || '').toLowerCase();
    const d2 = await getD2();

    if (!type || !d2.models[type]) {
        return;
    }

    return d2.models[type]
        .get(dataItem.id, {
            fields: 'legendSet[id,displayName~rename(name)]',
        })
        .then(model => model.legendSet);
};

export const formatLegendItems = legendItems => {
    const sortedItems = sortBy('startValue', legendItems);
    return sortedItems.map(item => ({
        color: item.color,
        name: item.name,
        range: item.startValue + ' - ' + item.endValue,
    }));
};

export const getBinsFromLegendItems = legendItems => {
    const sortedItems = sortBy('startValue', legendItems);
    const lastItem = sortedItems[sortedItems.length - 1];
    const bins = sortedItems.map(item => item.startValue);

    bins.push(lastItem.endValue);
    return bins;
};

export const getColorScaleFromLegendItems = legendItems => {
    const sortedItems = sortBy('startValue', legendItems);
    return sortedItems.map(item => item.color);
};

export const getLabelsFromLegendItems = legendItems => {
    const sortedItems = sortBy('startValue', legendItems);
    return sortedItems.map(item => item.name);
};

export const getCategoryLegendItems = (options, radius) =>
    Object.keys(options).map(option => ({
        name: option,
        color: options[option],
        radius: radius,
    }));

// Returns a legend created from a pre-defined legend set
export const getPredefinedLegendItems = async legendSet => {
    const { legends } = await loadLegendSet(legendSet);
    const pickSome = pick(['name', 'startValue', 'endValue', 'color']);

    return sortBy('startValue', legends)
        .map(pickSome)
        .map(
            item =>
                item.name === `${item.startValue} - ${item.endValue}`
                    ? { ...item, name: '' } // Clear name if same as startValue - endValue
                    : item
        );
};

export const getAutomaticLegendItems = (
    data,
    method = CLASSIFICATION_EQUAL_INTERVALS,
    classes = defaultClasses,
    colorScale = defaultColorScale
) => {
    const items = data.length ? getLegendItems(data, method, classes) : [];
    const colors = colorScale.split(',');

    return items.map((item, index) => ({
        ...item,
        color: colors[index],
    }));
};
