import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { sortBy } from 'lodash/fp';
import { pick } from 'lodash/fp';
import { getLegendItems } from '../util/classify';
import { defaultClasses, defaultColorScale } from '../util/colorscale';
import { CLASSIFICATION_EQUAL_INTERVALS } from '../constants/layers';

export const loadLegendSet = async legendSet => {
    const d2 = await getD2();
    return d2.models.legendSet.get(legendSet.id); // TODO: Restrict loading fields
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

// Returns a legend created from a pre-defined legend set
export const getPredefinedLegendItems = legendSet => {
    const pickSome = pick(['name', 'startValue', 'endValue', 'color']);

    return sortBy('startValue', legendSet.legends)
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

// Used for legend in map plugins
export const getHtmlLegend = (
    {
        title,
        period,
        description,
        filters,
        unit,
        items,
        explanation,
        source,
        sourceUrl,
    },
    hasData
) => {
    let legend = `<div class="dhis2-legend">
        <h2>${title} <span>${period}</span></h2>`;

    if (description) {
        legend += `<div className="dhis2-legend-description">${description}</div>`;
    }

    if (filters) {
        legend += `<div className="dhis2-legend-filters">
            ${i18n.t('Filters')}: ${filters.join(', ')}
        </div>`;
    }

    if (unit) {
        legend += `<div className="dhis2-legend-unit">${unit}</div>`;
    }

    if (hasData) {
        legend += `<dl class="dhis2-legend-automatic">${items
            .map(getHtmlLegendItem)
            .join('')}</dl>`;
    } else {
        `<p><em>${i18n.t('No data found')}</em></p>`;
    }

    if (explanation) {
        legend += `<div className="dhis2-legend-explanation">${explanation}</div>`;
    }

    if (source) {
        legend += `<div className="dhis2-legend-source">
                Source:&nbsp;
                ${
                    sourceUrl
                        ? `<a href=${sourceUrl}>{source}</a>`
                        : `<span>${source}</span>`
                }
            </div>`;
    }

    legend += `</div>`;

    return legend;
};

// Helper function to get a legend item
const getHtmlLegendItem = ({ color, name, startValue, endValue, count }) => `
  <dt style="background-color:${color}"></dt>
  <dd>${name || ''} ${!isNaN(startValue) ? `${startValue} - ${endValue}` : ''} 
    ${count !== undefined ? `(${count})` : ''}
  </dd>`;
