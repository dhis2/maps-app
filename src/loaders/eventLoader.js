import i18next from 'i18next';
import { getInstance as getD2 } from 'd2/lib/d2';
import isString from 'd2-utilizr/lib/isString';
import { isValidCoordinate } from '../util/map';
import { getClassBins, getClass } from '../util/classify';
import { getNumericLegendItems, getCategoryLegendItems } from '../util/legend';
import {
    getOrgUnitsFromRows,
    getDataItemsFromColumns,
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodFromFilters,
    getPeriodNameFromId
} from '../util/analytics';
import { EVENT_COLOR, EVENT_RADIUS } from '../constants/layers';

// Look at: https://github.com/dhis2/maintenance-app/blob/master/src/App/appStateStore.js

const eventLoader = async (config) => { // Returns a promise
    const {
        classes,
        colorScale,
        columns,
        endDate,
        eventClustering,
        eventCoordinateField,
        eventPointColor,
        eventPointRadius,
        filters,
        method,
        program,
        programStage,
        rows,
        startDate,
        styleDataItem,
    } = config;

    const orgUnits = getOrgUnitsFromRows(rows);
    const period = getPeriodFromFilters(filters);
    const dataItems = addStyleDataItem(columns, styleDataItem);
    const dataFilters = getFiltersFromColumns(columns);
    const d2 = await getD2();
    const spatialSupport = d2.system.systemInfo.databaseInfo.spatialSupport;

    let analyticsRequest = await getAnalyticsRequest(program, programStage, period, startDate, endDate, orgUnits, dataItems, eventCoordinateField);

    const legend = {
        period: period ? getPeriodNameFromId(period.id) : `${startDate} - ${endDate}`,
        filters: dataFilters && getFiltersAsText(dataFilters),
    };

    let bounds;
    let serverCluster;
    let data;

    if (spatialSupport && eventClustering) {
        const response = await d2.analytics.events.getCount(analyticsRequest);
        bounds = getBounds(response.extent);
        serverCluster = useServerCluster(response.count);
    }

    if (!serverCluster) {
        const response = await d2.analytics.events.getQuery(analyticsRequest);
        const names = {
            // ...data.metaData.names, // TODO: In use?
            // ...data.metaData.optionNames, // TODO: In use? See below
            true: i18next.t('Yes'),
            false: i18next.t('No'),
        };

        // names[header.name] = header.column;

        // Find header names and keys - TODO: Needed?
        response.headers.forEach(header => names[header.name] = header.column);

        data = response.rows
            .map(row => createEventFeature(response.headers, names, row, eventCoordinateField))
            .filter(feature => isValidCoordinate(feature.geometry.coordinates));

        const styleByNumeric = method && classes && colorScale;
        const styleByOptionSet = styleDataItem && styleDataItem.optionSet && styleDataItem.optionSet.options;

        if (Array.isArray(data) && data.length) {
            if (styleDataItem) {
                // Set value property to value of styleDataItem
                data.forEach(feature => feature.properties.value = feature.properties[styleDataItem.id]);
                legend.unit = styleDataItem.name;

                if (styleByNumeric) {
                    const values = data.map(feature => Number(feature.properties.value)).sort((a, b) => a - b);
                    const bins = getClassBins(values, method, classes);

                    data.forEach(feature =>
                        feature.properties.color = colorScale[getClass(Number(feature.properties.value), bins) - 1]
                    );
                    legend.items = getNumericLegendItems(bins, colorScale, eventPointRadius || EVENT_RADIUS);
                } else if (styleByOptionSet) {
                    data.forEach(feature => {
                        feature.properties.color = styleDataItem.optionSet.options[feature.properties.value];
                    });
                    legend.items = getCategoryLegendItems(styleDataItem.optionSet.options, eventPointRadius || EVENT_RADIUS);
                }

                legend.items.push({
                    name: i18next.t('Not set'),
                    color: eventPointColor || EVENT_COLOR,
                    radius: eventPointRadius || EVENT_RADIUS,
                });
            } else { // Simple style
                legend.items = [{
                    name: i18next.t('Event'),
                    color: eventPointColor || EVENT_COLOR,
                    radius: eventPointRadius || EVENT_RADIUS,
                }];
            }
        }
    }

    return {
        ...config,
        title: programStage.name,
        legend,
        data,
        bounds,
        serverCluster,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};




const getBounds = (bbox) => {
    if (!bbox) {
        return null;
    }
    const extent = bbox.match(/([-\d\.]+)/g);
    return [[extent[1], extent[0]], [extent[3], extent[2]]]
};

// Server clustering if more than 2000 events
const useServerCluster = (count) => count > 2000; // TODO: Use constant

// Also used to query for server cluster in map/EventLayer.js
export const getAnalyticsRequest = async (program, programStage, period, startDate, endDate, orgUnits, dataItems, eventCoordinateField) => {
    const d2 = await getD2();

    let analyticsRequest = new d2.analytics.request()
        .withProgram(program.id)
        .withStage(programStage.id)
        .withCoordinatesOnly(true);

    analyticsRequest = period ? analyticsRequest.addPeriodFilter(period.id) : analyticsRequest
        .withStartDate(startDate)
        .withEndDate(endDate);

    analyticsRequest = analyticsRequest.addOrgUnitDimension(orgUnits.map(ou => ou.id));

    dataItems.forEach(item => {
        analyticsRequest = analyticsRequest.addDimension(item.dimension, item.filter);
    });

    if (eventCoordinateField) { // If coordinate field other than event coordinate
        analyticsRequest = analyticsRequest
            .addDimension(eventCoordinateField) // Used by analytics/events/query/
            .withCoordinateField(eventCoordinateField); // Used by analytics/events/count and analytics/events/cluster
    }

    return analyticsRequest;
};


// Include column for data element used for styling
export const addStyleDataItem = (dataItems, styleDataItem)  =>
    styleDataItem ? [
        ...dataItems, styleDataItem && {
            dimension: styleDataItem.id,
            name: styleDataItem.name,
        }
    ] : [ ...dataItems ];


const createEventFeature = (headers, names, event, eventCoordinateField) => {
    const properties = event.reduce((props, value, i) => ({
        ...props,
        [headers[i].name]: names[value] || value,
    }), {});

    let coordinates;

    if (eventCoordinateField) { // If coordinate field other than event location
        const eventCoord = properties[eventCoordinateField];

        if (Array.isArray(eventCoord)) {
            coordinates = eventCoord;
        } else if (isString(eventCoord)) {
            coordinates = JSON.parse(eventCoord);
        }
    } else { // Use event location
        coordinates = [properties.longitude, properties.latitude]; // Event location
    }

    return {
        type: 'Feature',
        id: properties.psi,
        properties,
        geometry: {
            type: 'Point',
            coordinates,
        }
    };
};

export default eventLoader;
