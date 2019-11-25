import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { findIndex, curry } from 'lodash/fp';
import { toGeoJson } from '../util/map';
import { dimConf } from '../constants/dimension';
import { getLegendItemForValue } from '../util/classify';
import { getDisplayProperty } from '../util/helpers';
import {
    loadLegendSet,
    getPredefinedLegendItems,
    getAutomaticLegendItems,
} from '../util/legend';
import {
    getOrgUnitsFromRows,
    getPeriodFromFilters,
    getValidDimensionsFromFilters,
    getDataItemFromColumns,
    getApiResponseNames,
} from '../util/analytics';
import { createAlert } from '../util/alerts';
import { formatLocaleDate } from '../util/time';
import {
    DEFAULT_RADIUS_LOW,
    DEFAULT_RADIUS_HIGH,
    CLASSIFICATION_PREDEFINED,
} from '../constants/layers';

const thematicLoader = async config => {
    let error;

    const response = await loadData(config).catch(err => {
        error = err;
    });

    if (!response) {
        return {
            ...config,
            ...(error && error.message
                ? {
                      alerts: [createAlert(i18n.t('Error'), error.message)],
                  }
                : {}),
            isLoaded: true,
            isVisible: true,
        };
    }

    const [features, data] = response;

    const {
        columns,
        rows,
        radiusLow = DEFAULT_RADIUS_LOW,
        radiusHigh = DEFAULT_RADIUS_HIGH,
        classes,
        colorScale,
        renderingStrategy = 'SINGLE',
    } = config;

    const isSingle = renderingStrategy === 'SINGLE';
    const period = getPeriodFromFilters(config.filters);
    const periods = getPeriodsFromMetaData(data.metaData);
    const dimensions = getValidDimensionsFromFilters(config.filters);
    const names = getApiResponseNames(data);
    const valuesByPeriod = !isSingle ? getValuesByPeriod(data) : null;
    const valueById = getValueById(data);
    const valueFeatures = features.filter(
        ({ id }) => valueById[id] !== undefined
    );
    const orderedValues = getOrderedValues(data);
    const minValue = orderedValues[0];
    const maxValue = orderedValues[orderedValues.length - 1];
    const dataItem = getDataItemFromColumns(columns);
    const name = names[dataItem.id];
    let legendSet = config.legendSet;
    let method = legendSet ? CLASSIFICATION_PREDEFINED : config.method; // Favorites often have wrong method
    let alert;

    if (legendSet) {
        legendSet = await loadLegendSet(legendSet);
    }

    const legend = {
        title: name,
        period: period
            ? names[period.id] || period.id
            : `${formatLocaleDate(config.startDate)} - ${formatLocaleDate(
                  config.endDate
              )}`,
        items: legendSet
            ? getPredefinedLegendItems(legendSet)
            : getAutomaticLegendItems(
                  orderedValues,
                  method,
                  classes,
                  colorScale
              ),
    };

    if (dimensions && dimensions.length) {
        legend.filters = dimensions.map(
            d =>
                `${names[d.dimension]}: ${d.items
                    .map(i => names[i.id])
                    .join(', ')}`
        );
    }

    if (isSingle) {
        legend.items.forEach(item => (item.count = 0));
    }

    const getLegendItem = curry(getLegendItemForValue)(legend.items);

    const getRadiusForValue = value =>
        ((value - minValue) / (maxValue - minValue)) *
            (radiusHigh - radiusLow) +
        radiusLow;

    if (!valueFeatures.length) {
        if (!features.length) {
            const orgUnits = getOrgUnitsFromRows(rows);

            alert = createAlert(
                orgUnits.length === 1
                    ? names[orgUnits[0].id] || i18n.t(orgUnits[0].name)
                    : i18n.t('Selected org units'),
                i18n.t('No coordinates found')
            );
        } else {
            alert = createAlert(name, i18n.t('No data found'));
        }
    }

    if (valuesByPeriod) {
        const periods = Object.keys(valuesByPeriod);
        periods.forEach(period => {
            const orgUnits = Object.keys(valuesByPeriod[period]);
            orgUnits.forEach(orgunit => {
                const item = valuesByPeriod[period][orgunit];
                const value = Number(item.value);
                const legend = getLegendItem(value);

                item.color = legend ? legend.color : '#888';
                item.radius = getRadiusForValue(value);
            });
        });
    } else {
        valueFeatures.forEach(({ id, geometry, properties }) => {
            const value = valueById[id];
            const item = getLegendItem(value);

            // A predefined legend can have a shorter range
            if (item) {
                item.count++;
                properties.color = item.color;
                properties.legend = item.name; // Shown in data table
                properties.range = `${item.startValue} - ${item.endValue}`; // Shown in data table
            }

            properties.value = value;
            properties.radius = getRadiusForValue(value);
            properties.type = geometry.type; // Shown in data table
        });
    }

    return {
        ...config,
        data: valueFeatures,
        periods,
        valuesByPeriod,
        name,
        legend,
        method,
        ...(alert ? { alerts: [alert] } : {}),
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

const getPeriodsFromMetaData = ({ dimensions, items }) =>
    dimensions.pe.map(id => {
        const { name, startDate, endDate } = items[id];

        const newEndDate = new Date(endDate);

        // Set to midnight to include the last day
        newEndDate.setHours(24);

        return {
            id,
            name,
            startDate: new Date(startDate),
            endDate: newEndDate,
        };
    });

const getValuesByPeriod = data => {
    const { headers, rows } = data;
    const periodIndex = findIndex(['name', 'pe'], headers);
    const ouIndex = findIndex(['name', 'ou'], headers);
    const valueIndex = findIndex(['name', 'value'], headers);

    return rows.reduce((obj, row) => {
        const period = row[periodIndex];
        const periodObj = (obj[period] = obj[period] || {});
        periodObj[row[ouIndex]] = {
            value: row[valueIndex],
        };
        return obj;
    }, {});
};

// Returns an object mapping org. units and values
const getValueById = data => {
    const { headers, rows } = data;
    const ouIndex = findIndex(['name', 'ou'], headers);
    const valueIndex = findIndex(['name', 'value'], headers);

    return rows.reduce((obj, row) => {
        obj[row[ouIndex]] = parseFloat(row[valueIndex]);
        return obj;
    }, {});
};

// Returns an array of ordered values
const getOrderedValues = data => {
    const { headers, rows } = data;
    const valueIndex = findIndex(['name', 'value'], headers);

    return rows.map(row => parseFloat(row[valueIndex])).sort((a, b) => a - b);
};

// Load features and data values from api
const loadData = async config => {
    const {
        rows,
        columns,
        filters,
        displayProperty,
        startDate,
        endDate,
        userOrgUnit,
        valueType,
        relativePeriodDate,
        aggregationType,
        renderingStrategy = 'SINGLE',
    } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const period = getPeriodFromFilters(filters);
    const dimensions = getValidDimensionsFromFilters(config.filters);
    const dataItem = getDataItemFromColumns(columns);
    const isOperand = columns[0].dimension === dimConf.operand.objectName;
    const isSingle = renderingStrategy === 'SINGLE';
    const d2 = await getD2();
    const displayPropertyUpper = getDisplayProperty(
        d2,
        displayProperty
    ).toUpperCase();
    const geoFeaturesParams = {};
    let orgUnitParams = orgUnits.map(item => item.id);
    let dataDimension = isOperand ? dataItem.id.split('.')[0] : dataItem.id;

    if (valueType === 'ds') {
        dataDimension += '.REPORTING_RATE';
    }

    let analyticsRequest = new d2.analytics.request()
        .addOrgUnitDimension(orgUnits.map(ou => ou.id))
        .addDataDimension(dataDimension)
        .withDisplayProperty(displayPropertyUpper);

    if (!isSingle) {
        analyticsRequest = analyticsRequest.addPeriodDimension(period.id);
    } else {
        analyticsRequest = period
            ? analyticsRequest.addPeriodFilter(period.id)
            : analyticsRequest.withStartDate(startDate).withEndDate(endDate);
    }

    if (dimensions) {
        dimensions.forEach(
            d =>
                (analyticsRequest = analyticsRequest.addFilter(
                    d.dimension,
                    d.items.map(i => i.id)
                ))
        );
    }

    if (Array.isArray(userOrgUnit) && userOrgUnit.length) {
        geoFeaturesParams.userOrgUnit = userOrgUnit.join(';');
        analyticsRequest = analyticsRequest.withUserOrgUnit(userOrgUnit);
    }

    if (relativePeriodDate) {
        analyticsRequest = analyticsRequest.withRelativePeriodDate(
            relativePeriodDate
        );
    }

    if (aggregationType) {
        analyticsRequest = analyticsRequest.withAggregationType(
            aggregationType
        );
    }

    if (isOperand) {
        analyticsRequest = analyticsRequest.addDimension('co');
    }

    // Features request
    const orgUnitReq = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayPropertyUpper)
        .getAll(geoFeaturesParams)
        .then(toGeoJson);

    // Data request
    const dataReq = d2.analytics.aggregate.get(analyticsRequest);

    // Return promise with both requests
    return Promise.all([orgUnitReq, dataReq]);
};

export default thematicLoader;
