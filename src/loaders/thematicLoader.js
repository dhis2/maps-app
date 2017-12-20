import i18next from 'i18next';
import { getInstance as getD2 } from 'd2/lib/d2';
import keyBy from 'lodash/fp/keyBy';
import findIndex from 'lodash/fp/findIndex';
import pick from 'lodash/fp/pick';
import curry from 'lodash/fp/curry';
import { toGeoJson } from '../util/map';
import { getClass } from '../util/classify';
import { dimConf } from '../constants/dimension';

import {
    loadLegendSet,
    getBinsFromLegendItems,
    getColorScaleFromLegendItems,
    getLabelsFromLegendItems,
    formatLegendItems,
} from '../util/legend';


import {
    getLegendItems,
    getColorsByRgbInterpolation,
} from '../util/classify';

import {
    getDisplayProperty,
} from '../util/helpers';

import {
    getOrgUnitsFromRows,
    getPeriodFromFilters,
    getDataItemsFromColumns,
} from '../util/analytics';

const thematicLoader = async (layout) => {
    const { legendSet } = layout;
    const [ features, data ] = await loadData(layout);
    // const featureById = keyBy('id', features);
    const valueById = getValueById(data);
    const legend = legendSet ? await createLegendFromLegendSet(legendSet) : createLegendFromConfig(data, layout);

    // const aggregationTypeLower = aggregationType ? i18next.t(aggregationType).toLowerCase() : '';
    // const valueFeatures = []; // only include features with values

    const getLegendItem = curry(getLegendItemForValue)(legend.items);

    features.forEach(({ id, properties }) => {
        const value = valueById[id];
        const item = getLegendItem(value);

        properties.value = value;
        properties.color = item && item.color;
    });

    /*
    if (legendSet) { // Pre-defined legend set
        const legend = await loadLegendSet(legendSet);
        const legendItems = legend.legends;
        const bins = getBinsFromLegendItems(legendItems);
        const colorScale = getColorScaleFromLegendItems(legendItems);
        const labels = getLabelsFromLegendItems(legendItems);

        valueFeatures.forEach(feature => {
            const prop = feature.properties;
            const value = prop.value; // TODO prev: gis.conf.finals.widget.value
            const classNumber = getClass(value, bins);
            prop.color = colorScale[classNumber - 1];
            // console.log(value, classNumber, prop.color);
        });

        config.legend.items = formatLegendItems(legendItems);
*/
        /*
        prop = features[i].properties;
        value = prop[options.indicator];
        classNumber = getClass(value, bounds);
        legendItem = legend.items[classNumber - 1];

        prop.color = options.colors[classNumber - 1];
        prop.radius = (value - options.minValue) / (options.maxValue - options.minValue) * (options.maxSize - options.minSize) + options.minSize;
        prop.legend = legendItem.name;

        // Count features in each class
        if (!options.count[classNumber]) {
          options.count[classNumber] = 1;
        } else {
          options.count[classNumber]++;
        }
        */
        /*
    } else { // Custom legend
        const elementMap = {
            'in': 'indicators',
            'de': 'dataElements',
            'ds': 'dataSets'
        };

        const elementUrl = elementMap[columns[0].objectName];
        const id = columns[0].items[0].id;
*/
        /*
        if (!elementUrl) {
            this.createLegend();
            return;
        }
        */

        // TODO: Not sure why this is needed
        /*
        apiFetch(`/${elementUrl}.json?fields=legendSet[id,displayName~rename(name)]&paging=false&filter=id:eq:${id}`)
          .then(data => {
              const elements = data[elementUrl];
              let set;

              if (arrayFrom(elements).length) {
                set = isObject(elements[0]) ? elements[0].legendSet || null : null;
              }

              if (set) {
                layer.legendSet = set;
                this.loadLegendSet();
              } else {
                this.createLegend();
              }
          });
        */


        // console.log('not a legend set');

    //}

    // console.log('Create legend');



    return {
        ...layout,
        data: features,
        legend,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};


// const isWithinItem =>


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

// Retursn a legend created from a pre-defined legend set
const createLegendFromLegendSet = async (legendSet) => {
    const { name, legends } = await loadLegendSet(legendSet)
    const pickSome = pick(['name', 'startValue', 'endValue', 'color']);
    return {
        title: name,
        items: legends.map(pickSome),
    };
};

const createLegendFromConfig = (data, config) => {
    const orderedValues = getOrderedValues(data);
    const { method, classes, colors, colorLow, colorHigh } = config;
    const items = getLegendItems(orderedValues, method, classes);
    const colorScale = colors || getColorsByRgbInterpolation(colorLow, colorHigh, classes);

    return {
        title: '',
        items: items.map((item, index) => ({
            ...item,
            color: colorScale[index],
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
    const displayPropertyUpper = (await getDisplayProperty(displayProperty)).toUpperCase();
    const d2 = await getD2();

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

    // Features promise
    const orgUnitReq = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayPropertyUpper)
        .getAll()
        .then(toGeoJson);

    // Data request
    const dataReq = d2.analytics.aggregate.get(analyticsRequest);

    // Load promise
    return Promise.all([orgUnitReq, dataReq]);
};


export default thematicLoader;



/*
class ThematicLoader {


    // Called when org units and data is loaded
    onLoad(orgUnits, data) {
        const features = toGeoJson(orgUnits, 'ASC');
        const layer = this.layer;

        this.metaData = data.metaData;

        if (!features.length) {
            gis.alert(GIS.i18n.no_valid_coordinates_found); // TODO
            return;
        }

        // const response = gis.api.response.Response(data); // validate - TODO: needed?
        const featureMap = {};
        const valueMap = {};
        const valueFeatures = []; // only include features with values
        const values = []; // to find min and max values

        this.aggregationType = (GIS.i18n[(layer.aggregationType || '').toLowerCase()] || '').toLowerCase();

        let ouIndex;
        let valueIndex;

        if (!data) {
            // TODO
            // if (gis.mask) {
            // gis.mask.hide();
            // }
            // return;
        }

        // ou index, value index
        for (let i = 0; i < data.headers.length; i++) {
            if (data.headers[i].name === this.dimConf.organisationUnit.dimensionName) {
                ouIndex = i;
            }
            else if (data.headers[i].name === this.dimConf.value.dimensionName) {
                valueIndex = i;
            }
        }

        // Feature map
        features.forEach(feature => {
            featureMap[feature.id] = true;
        });

        // Value map
        data.rows.forEach(row => {
            valueMap[row[ouIndex]] = parseFloat(row[valueIndex]);
        });

        features.forEach(feature => {
            const id = feature.id;

            if (featureMap.hasOwnProperty(id) && valueMap.hasOwnProperty(id)) {
                feature.properties.value = valueMap[id];
                feature.properties.aggregationType = this.aggregationType;
                valueFeatures.push(feature);
                values.push(valueMap[id]);
            }
        });

        // Sort values in ascending order
        values.sort((a, b) => a - b);

        this.features = valueFeatures;
        this.values = values;

        this.loadLegend(features, values);
    }

    loadLegend(features, values) {
        const layer = this.layer;

        this.bounds = [];
        this.colors = [];
        this.names = [];
        this.count = {}; // number in each class

        let legends = [];

        if (layer.legendSet) { // Pre-defined legend set
            this.loadLegendSet();
        } else { // Custom legend
            const elementMap = {
                'in': 'indicators',
                'de': 'dataElements',
                'ds': 'dataSets'
            };



            const elementUrl = elementMap[layer.columns[0].objectName];
            const id = layer.columns[0].items[0].id;



            if (!elementUrl) {
                this.createLegend();
                return;
            }

            // TODO: Not sure why this is needed
            apiFetch(`/${elementUrl}.json?fields=legendSet[id,displayName~rename(name)]&paging=false&filter=id:eq:${id}`)
                .then(data => {
                    const elements = data[elementUrl];
                    let set;

                    if (arrayFrom(elements).length) {
                        set = isObject(elements[0]) ? elements[0].legendSet || null : null;
                    }

                    if (set) {
                        layer.legendSet = set;
                        this.loadLegendSet();
                    } else {
                        this.createLegend();
                    }
                });
        }
    }

    loadLegendSet() {
        const layer = this.layer;
        const fields = gis.conf.url.legendSetFields.join(','); // TODO
        const bounds = this.bounds;
        const colors = this.colors;
        const names = this.names;

        apiFetch(`/legendSets/${layer.legendSet.id}.json?fields=${fields}`)
            .then(data => {
                const legendItems = data.legends;

                arraySort(legendItems, 'ASC', 'startValue');

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

            });
    }

    createLegend() {
        const layer = this.layer;
        const method = layer.method;
        const metaData = this.metaData;
        const bounds = this.bounds;
        const colors = this.colors;
        const names = this.names;
        const values = this.values;
        const features = this.features;

        // All dimensions
        const dimensions = arrayClean([].concat(layer.columns || [], layer.rows || [], layer.filters || []));
        // const peIds = metaData[this.dimConf.period.objectName];
        const peIds = metaData.dimensions[this.dimConf.period.objectName];

        for (let i = 0, dimension; i < dimensions.length; i++) {
            dimension = dimensions[i];

            for (let j = 0, item; j < dimension.items.length; j++) {
                item = dimension.items[j];
                item.name = metaData.items[item.id];
            }
        }

        // Period name without changing the id
        layer.filters[0].items[0].name = metaData.items[peIds[peIds.length - 1]];

        const options = { // Classification options
            indicator: gis.conf.finals.widget.value, // TODO
            method: layer.method,
            numClasses: layer.classes,
            bounds: bounds,
            colors: layer.colorScale ? layer.colorScale.split(',') : colors,
            count: this.count,
            minSize: layer.radiusLow,
            maxSize: layer.radiusHigh,
            minValue: values[0],
            maxValue: values[values.length - 1],
            colorLow: layer.colorLow,
            colorHigh: layer.colorHigh
        };

        //if (!loader.isDrillDown) { // TODO: Where is this set?
        // updateLegend(layer, metaData, options);
        //}

        // Build legend object
        const legend = {
            items: []
        };

        const legendNames = layer.legendSet ? layer.legendSet.names || {} : {};

        // title
        let id = layer.columns[0].items[0].id;

        // event data items
        if (layer.valueType === 'di') {
            id = layer.program.id + '.' + id;
        }

        let name = layer.columns[0].items[0].name;

        // legend.title = (metaData.names[id] || name || id) + (aggregationType ? ` (${aggregationType})` : '');
        layer.title = (metaData.items[id] ? metaData.items[id].name : name || id) + (this.aggregationType ? ` (${this.aggregationType})` : '');

        // period
        id = layer.filters[0].items[0].id;
        name = layer.filters[0].items[0].name;

        layer.subtitle = (metaData.items[id] ? metaData.items[id].name : name || id);

        if (method === 1 && layer.legendSet) { // Predefined legend
            for (let i = 0; i < bounds.length - 1; i++) {
                const name = legendNames[i];
                const label = bounds[i] + ' - ' + bounds[i + 1];
                const count = ' (' + (options.count[i + 1] || 0) + ')';

                const item = {
                    color: options.colors[i],
                };

                if (name === label) {
                    item.name = label + count;
                } else {
                    item.name = name || '';
                    item.range = label + count;
                }

                legend.items.push(item);
            }
        } else if (method === 2) { // equal intervals
            for (let i = 0; i <= options.numClasses; i++) {
                bounds[i] = options.minValue + i * (options.maxValue - options.minValue) / options.numClasses;

            }
            options.bounds = bounds;

            if (!options.colors.length) { // Backward compability
                options.colors = getColorsByRgbInterpolation(options.colorLow, options.colorHigh, options.numClasses);
            }

            for (let i = 0; i < options.bounds.length - 1; i++) {
                legend.items.push({
                    color: options.colors[i],
                    range: options.bounds[i].toFixed(1) + ' - ' + options.bounds[i + 1].toFixed(1), //  + ' (' + (options.count[i + 1] || 0) + ')',
                });
            }
        } else if (method === 3) { // quantiles
            const binSize = Math.round(values.length / options.numClasses);
            let binLastValPos = (binSize === 0) ? 0 : binSize;

            if (values.length > 0) {
                bounds[0] = values[0];
                for (let i = 1; i < options.numClasses; i++) {
                    bounds[i] = values[binLastValPos];
                    binLastValPos += binSize;

                    if (binLastValPos > values.length - 1) {
                        binLastValPos = values.length - 1;
                    }
                }
                bounds.push(values[values.length - 1]);
            }

            for (let j = 0; j < bounds.length; j++) {
                bounds[j] = parseFloat(bounds[j]);
            }

            options.bounds = bounds;

            if (!options.colors.length) { // Backward compability
                options.colors = getColorsByRgbInterpolation(options.colorLow, options.colorHigh, options.numClasses);
            }

            // TODO: Reuse same loop above
            for (let i = 0; i < options.bounds.length - 1; i++) {
                legend.items.push({
                    color: options.colors[i],
                    range: options.bounds[i].toFixed(1) + ' - ' + options.bounds[i + 1].toFixed(1), //  + ' (' + (options.count[i + 1] || 0) + ')',
                });
            }
        }

        // Apply classification
        classify(features, values, options, legend);

        layer.legend = legend;
        layer.data = features;
        layer.isLoaded = true;

        this.callback(layer);
    }
}

export default ThematicLoader;
*/