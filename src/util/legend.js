import { apiFetch } from '../util/api';
import sortBy from 'lodash/fp/sortBy';

export const loadLegendSet = async (legendSet) => {
    const fields = gis.conf.url.legendSetFields.join(','); // TODO

    // console.log(legendSet, fields);

    // TODO: Load with d2
    return apiFetch(`/legendSets/${legendSet.id}.json?fields=${fields}`);
        //.then(legend => {
        //    const legendItems = legend.legends;

        //    console.log('legend data', data);

          // arraySort(legendItems, 'ASC', 'startValue');

          /*
          legendItems.forEach(item => {
            if (bounds[bounds.length - 1] !== item.startValue) {
              if (bounds.length !== 0) {
                colors.push('#F0F0F0');
                names.push('');
              }
              bounds.push(item.startValue);
            }
            colors.push(item.color);
            names.push(item.name);
            bounds.push(item.endValue);

          });

          layer.method = 1; // Predefined legend
          layer.legendSet.names = names;
          layer.legendSet.bounds = bounds;
          layer.legendSet.colors = colors;
          layer.legendSet.count = this.count;

          this.createLegend()
          */

    //});
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
