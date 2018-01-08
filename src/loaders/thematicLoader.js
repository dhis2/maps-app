import i18next from 'i18next';
import { getInstance as getD2 } from 'd2/lib/d2';
import findIndex from 'lodash/fp/findIndex';
import sortBy from 'lodash/fp/sortBy';
import pick from 'lodash/fp/pick';
import curry from 'lodash/fp/curry';
import { toGeoJson } from '../util/map';
import { dimConf } from '../constants/dimension';
import { getLegendItems, getColorsByRgbInterpolation } from '../util/classify';
import { getDisplayProperty } from '../util/helpers';
import { getOrgUnitsFromRows, getPeriodFromFilters, getDataItemsFromColumns } from '../util/analytics';

const thematicLoader = async (config) => {
    const { columns, legendSet, radiusLow, radiusHigh } = config;
    const [ features, data ] = await loadData(config);
    const valueById = getValueById(data);
    const valueFeatures = features.filter(({ id }) => valueById[id] !== undefined);
    const orderedValues = getOrderedValues(data);
    const minValue = orderedValues[0];
    const maxValue = orderedValues[orderedValues.length - 1];
    const dataItem = getDataItemsFromColumns(columns)[0];
    const name = config.name || dataItem.name;
    const legend = legendSet ? await createLegendFromLegendSet(legendSet) : createLegendFromConfig(orderedValues, config);
    const getLegendItem = curry(getLegendItemForValue)(legend.items);
    let alerts = [];

    legend.period = data.metaData.dimensions.pe[0];

    if (!valueFeatures.length) {
        alerts.push({
            title: config.name,
            description: i18next.t('No data found'),
        });
    }

    valueFeatures.forEach(({ id, properties }) => {
        const value = valueById[id];
        const item = getLegendItem(value);

        item.count === undefined ? item.count = 1 : item.count++;

        properties.value = value;
        properties.color = item && item.color;
        properties.radius = (value - minValue) / (maxValue - minValue) * (radiusHigh - radiusLow) + radiusLow;
    });

    return {
        ...config,
        data: valueFeatures,
        name,
        legend,
        ...(alerts.length ? { alerts } : {}),
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

// Returns legend item where a value belongs
const getLegendItemForValue = (legendItems, value) => {
    const isLast = (index) => index === legendItems.length - 1;
    return legendItems.find((item, index) =>
        value >= item.startValue && (value < item.endValue || (isLast(index) && value === item.endValue)));
};

// Returns an object mapping org. units and values
const getValueById = (data) => {
    const { headers, rows } = data;
    const ouIndex = findIndex(['name', 'ou'], headers);
    const valueIndex = findIndex(['name', 'value'], headers);

    return rows.reduce((obj, row) => {
        obj[row[ouIndex]] = parseFloat(row[valueIndex]);
        return obj;
    }, {});
};

// Returns an array of ordered values
const getOrderedValues = (data) => {
    const { headers, rows } = data;
    const valueIndex = findIndex(['name', 'value'], headers);

    return rows.map(row => parseFloat(row[valueIndex])).sort((a, b) => a - b);
};

// Returns a legend created from a pre-defined legend set
const createLegendFromLegendSet = async (legendSet) => {
    const d2 = await getD2();
    const { name, legends } = await d2.models.legendSet.get(legendSet.id);
    const pickSome = pick(['name', 'startValue', 'endValue', 'color']);
    return {
        title: name,
        items: sortBy('startValue', legends).map(pickSome),
    };
};

const createLegendFromConfig = (data, config) => {
    const { method, classes, colorScale, colorLow, colorHigh } = config;
    const items = getLegendItems(data, method, classes);
    const colors = colorScale ? colorScale.split(',') : getColorsByRgbInterpolation(colorLow, colorHigh, classes);

    return {
        items: items.map((item, index) => ({
            ...item,
            color: colors[index],
        })),
    };
};

// Load features and data values from api
const loadData = async (config) => {
    const { rows, columns, filters, displayProperty, userOrgUnit, valueType, relativePeriodDate, aggregationType } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const period = getPeriodFromFilters(filters);
    const dataItems = getDataItemsFromColumns(columns);
    const isOperand = columns[0].dimension === dimConf.operand.objectName;
    const d2 = await getD2();
    const displayPropertyUpper = getDisplayProperty(d2, displayProperty).toUpperCase();

    let orgUnitParams = orgUnits.map(item => item.id);
    let dataDimension = dataItems.map(item => isOperand ? item.id.split('.')[0] : item.id);

    if (valueType === 'ds') {
        dataDimension = dataDimension.map(id => id + '.REPORTING_RATE'); // TODO: Correct?
    }

    let analyticsRequest = new d2.analytics.request()
        .addOrgUnitDimension(orgUnits.map(ou => ou.id))
        .addDataDimension(dataDimension)
        .addPeriodFilter(period.id)
        .withDisplayProperty(displayPropertyUpper);

    if (Array.isArray(userOrgUnit) && userOrgUnit.length) {
        orgUnitParams += '&userOrgUnit=' + userOrgUnit.join(';');
        analyticsRequest = analyticsRequest.withUserOrgUnit(userOrgUnit.join(';'));
    }

    if (relativePeriodDate) {
        analyticsRequest = analyticsRequest.withRelativePeriodDate(relativePeriodDate);
    }

    if (aggregationType) {
        analyticsRequest = analyticsRequest.withAggregationType(aggregationType);
    }

    if (Array.isArray(userOrgUnit) && userOrgUnit.length) {
        analyticsRequest = analyticsRequest.addUserOrgUnit(userOrgUnit.map(ou => ou));
    }

    if (isOperand) {
        analyticsRequest = analyticsRequest.addDimension('co');
    }

    // Features request
    const orgUnitReq = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayPropertyUpper)
        .getAll()
        .then(toGeoJson);

    // Data request
    const dataReq = d2.analytics.aggregate.get(analyticsRequest);

    // Return promise with both requests
    return Promise.all([orgUnitReq, dataReq]);
};

export default thematicLoader;
