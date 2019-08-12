import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { curry, isString, isEmpty } from 'lodash/fp';
import { timeFormat } from 'd3-time-format';
import { isValidCoordinate } from '../util/map';
import { getClassBins, getLegendItemForValue } from '../util/classify';
import { getNumericLegendItems, getCategoryLegendItems } from '../util/legend';
import {
    getOrgUnitsFromRows,
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodFromFilters,
    getPeriodNameFromId,
    getApiResponseNames,
} from '../util/analytics';
import { EVENT_COLOR, EVENT_RADIUS } from '../constants/layers';
import { defaultClasses, defaultColorScale } from '../util/colorscale';
import { createAlert } from '../util/alerts';

// Look at: https://github.com/dhis2/maintenance-app/blob/master/src/App/appStateStore.js

const formatTime = date => timeFormat('%Y-%m-%d')(new Date(date));

const accessDeniedAlert = createAlert(
    i18n.t('Access denied'),
    i18n.t('user is not allowed to read layer data')
);
const unknownErrorAlert = createAlert(
    i18n.t('Failed'),
    i18n.t('an unknown error occurred while reading layer data')
);

// TODO: Refactor to share code with other loaders
// Returns a promise
const eventLoader = async layerConfig => {
    let config = { ...layerConfig };
    try {
        await loadEventLayer(config);
    } catch (e) {
        if (e.httpStatusCode === 403 || e.httpStatusCode === 409) {
            config.alerts = [accessDeniedAlert];
        } else {
            config.alerts = [unknownErrorAlert];
        }
    }

    config.isLoaded = true;
    config.isExpanded = true;
    config.isVisible = true;

    return config;
};

const loadEventLayer = async config => {
    const {
        classes = defaultClasses,
        colorScale = defaultColorScale,
        columns,
        endDate,
        eventClustering,
        eventCoordinateField,
        eventPointColor,
        eventPointRadius,
        filters,
        method = 2,
        program,
        programStage,
        rows,
        startDate,
        styleDataItem,
        areaRadius,
        relativePeriodDate,
    } = config;

    const orgUnits = getOrgUnitsFromRows(rows);
    const period = getPeriodFromFilters(filters);
    const dataItems = addStyleDataItem(columns, styleDataItem);
    const dataFilters = getFiltersFromColumns(columns);
    const d2 = await getD2();
    const spatialSupport = d2.system.systemInfo.databaseInfo.spatialSupport;

    // console.log('dataItems', dataItems);

    let analyticsRequest = await getAnalyticsRequest(
        program,
        programStage,
        period,
        startDate,
        endDate,
        orgUnits,
        dataItems,
        eventCoordinateField,
        relativePeriodDate
    );

    const legend = {
        period: period
            ? getPeriodNameFromId(period.id)
            : `${formatTime(startDate)} - ${formatTime(endDate)}`,
    };

    let bounds;
    let serverCluster;
    let data;
    let names;

    if (spatialSupport && eventClustering) {
        const response = await d2.analytics.events.getCount(analyticsRequest);
        bounds = getBounds(response.extent);
        serverCluster = useServerCluster(response.count);
    }

    if (!serverCluster) {
        const response = await d2.analytics.events.getQuery(analyticsRequest);
        names = getApiResponseNames(response);
        const optionSetHeaders = response.headers.filter(
            header => header.optionSet
        );

        // Load option sets used for filtering/styling
        if (optionSetHeaders.length) {
            await Promise.all(
                optionSetHeaders.map(header =>
                    d2.models.optionSets
                        .get(header.optionSet, {
                            fields: 'id,options[code,displayName~rename(name)]',
                        })
                        .then(model => model.options)
                        .then(options =>
                            options.forEach(
                                ({ code, name }) => (names[code] = name)
                            )
                        )
                )
            );
        }

        data = response.rows
            .map(row =>
                createEventFeature(
                    response.headers,
                    names,
                    row,
                    eventCoordinateField
                )
            )
            .filter(feature => isValidCoordinate(feature.geometry.coordinates));

        const styleByNumeric =
            styleDataItem && styleDataItem.valueType === 'INTEGER';
        const styleByOptionSet =
            styleDataItem &&
            styleDataItem.optionSet &&
            styleDataItem.optionSet.options;

        if (Array.isArray(data) && data.length) {
            if (styleDataItem) {
                // Set value property to value of styleDataItem
                data.forEach(
                    feature =>
                        (feature.properties.value =
                            feature.properties[styleDataItem.id])
                );
                legend.unit = styleDataItem.name;

                if (styleByNumeric) {
                    const values = data
                        .map(feature => Number(feature.properties.value))
                        .sort((a, b) => a - b);
                    const bins = getClassBins(values, method, classes);
                    const colors = colorScale ? colorScale.split(',') : [];
                    legend.items = getNumericLegendItems(
                        bins,
                        colors,
                        eventPointRadius || EVENT_RADIUS
                    );

                    const getLegendItem = curry(getLegendItemForValue)(
                        legend.items
                    );

                    data.forEach(
                        feature =>
                            (feature.properties.color = getLegendItem(45).color)
                    );
                } else if (styleByOptionSet) {
                    data.forEach(feature => {
                        feature.properties.color =
                            styleDataItem.optionSet.options[
                                feature.properties.value
                            ];
                    });
                    legend.items = getCategoryLegendItems(
                        styleDataItem.optionSet.options,
                        eventPointRadius || EVENT_RADIUS
                    );
                }

                legend.items.push({
                    name: i18n.t('Not set'),
                    color: eventPointColor || EVENT_COLOR,
                    radius: eventPointRadius || EVENT_RADIUS,
                });
            } else {
                // Simple style
                legend.items = [
                    {
                        name: i18n.t('Event'),
                        color: eventPointColor || EVENT_COLOR,
                        radius: eventPointRadius || EVENT_RADIUS,
                    },
                ];
            }

            if (areaRadius) {
                legend.items.forEach(
                    item => (item.name += ` + ${areaRadius} ${'m'} ${'buffer'}`)
                );
            }
        }
    }

    if (!serverCluster) {
        legend.filters = dataFilters && getFiltersAsText(dataFilters, names);
    }

    return {
        ...config,
        name: programStage.name,
        legend,
        data,
        bounds,
        serverCluster,
    };
};

const getBounds = bbox => {
    if (!bbox) {
        return null;
    }
    const extent = bbox.match(/([-\d\.]+)/g);
    return [[extent[1], extent[0]], [extent[3], extent[2]]];
};

// Server clustering if more than 2000 events
const useServerCluster = count => count > 2000; // TODO: Use constant

// Also used to query for server cluster in map/EventLayer.js
export const getAnalyticsRequest = async (
    program,
    programStage,
    period,
    startDate,
    endDate,
    orgUnits,
    dataItems,
    eventCoordinateField,
    relativePeriodDate
) => {
    const d2 = await getD2();

    let analyticsRequest = new d2.analytics.request()
        .withProgram(program.id)
        .withStage(programStage.id)
        .withCoordinatesOnly(true);

    analyticsRequest = period
        ? analyticsRequest.addPeriodFilter(period.id)
        : analyticsRequest.withStartDate(startDate).withEndDate(endDate);

    if (relativePeriodDate) {
        analyticsRequest = analyticsRequest.withRelativePeriodDate(
            relativePeriodDate
        );
    }

    analyticsRequest = analyticsRequest.addOrgUnitDimension(
        orgUnits.map(ou => ou.id)
    );

    if (dataItems) {
        dataItems.forEach(item => {
            if (item.dimension && item.filter) {
                // Empty filter sometimes returned for favorite
                analyticsRequest = analyticsRequest.addDimension(
                    item.dimension,
                    item.filter
                );
            }
        });
    }

    if (eventCoordinateField) {
        // If coordinate field other than event coordinate
        analyticsRequest = analyticsRequest
            .addDimension(eventCoordinateField) // Used by analytics/events/query/
            .withCoordinateField(eventCoordinateField); // Used by analytics/events/count and analytics/events/cluster
    }

    return analyticsRequest;
};

// Include column for data element used for styling
export const addStyleDataItem = (dataItems, styleDataItem) =>
    styleDataItem
        ? [
              ...dataItems,
              styleDataItem && {
                  dimension: styleDataItem.id,
                  name: styleDataItem.name,
              },
          ]
        : [...dataItems];

const createEventFeature = (headers, names, event, eventCoordinateField) => {
    const properties = event.reduce(
        (props, value, i) => ({
            ...props,
            [headers[i].name]: names[value] || value,
        }),
        {}
    );

    let coordinates;

    if (eventCoordinateField) {
        // If coordinate field other than event location
        const eventCoord = properties[eventCoordinateField];

        if (Array.isArray(eventCoord)) {
            coordinates = eventCoord;
        } else if (isString(eventCoord) && !isEmpty(eventCoord)) {
            coordinates = JSON.parse(eventCoord);
        } else {
            coordinates = [];
        }
    } else {
        // Use event location
        coordinates = [properties.longitude, properties.latitude]; // Event location
    }

    return {
        type: 'Feature',
        id: properties.psi,
        properties,
        geometry: {
            type: 'Point',
            coordinates: coordinates.map(parseFloat),
        },
    };
};

export default eventLoader;
