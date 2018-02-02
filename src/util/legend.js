import { getInstance as getD2 } from 'd2/lib/d2';
import sortBy from 'lodash/fp/sortBy';
import { apiFetch } from '../util/api';
import { legendSetFields } from '../util/helpers';

export const loadLegendSet = async (legendSet) => {
    const fields = legendSetFields.join(',');
    const d2 = await getD2();

    return d2.models.legendSet.get(legendSet.id);
};

export const loadDataItemLegendSet = async (dataItem) => {
    const type = (dataItem.dimensionItemType || '').toLowerCase();
    const d2 = await getD2();

    if (!type || !d2.models[type]) {
        return;
    }

    return d2.models[type].get(dataItem.id, {
        fields: 'legendSet[id,displayName~rename(name)]',
    }).then(model => model.legendSet);
};

export const formatLegendItems = (legendItems) => {
    const sortedItems = sortBy('startValue', legendItems);
    return sortedItems.map(item => ({
        color: item.color,
        name: item.name,
        range: item.startValue + ' - ' + item.endValue,
    }));
};

export const getBinsFromLegendItems = (legendItems) => {
  const sortedItems = sortBy('startValue', legendItems);
  const lastItem = sortedItems[sortedItems.length -1 ];
  const bins = sortedItems.map(item => item.startValue);

  bins.push(lastItem.endValue);
  return bins;
};

export const getColorScaleFromLegendItems = (legendItems) => {
  const sortedItems = sortBy('startValue', legendItems);
  return sortedItems.map(item => item.color);
};

export const getLabelsFromLegendItems = (legendItems) => {
  const sortedItems = sortBy('startValue', legendItems);
  return sortedItems.map(item => item.name);
};

// TODO: Add support for counts in each class?
export const getNumericLegendItems = (bins, colors, radius) => {
    const items = [];

    for (let i = 0, item; i < bins.length - 1; i++) {
        items.push({
            name: `${bins[i]} - ${bins[i + 1]}`,
            color: colors[i],
            radius,
        });
    }

    return items;
};


// TODO: Add support for counts in each class?
export const getCategoryLegendItems = (options, radius) =>
    Object.keys(options).map(option => ({
        name: option,
        color: options[option],
        radius: radius,
    }));
