import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { isString, isEmpty } from 'lodash/fp';
import { timeFormat } from 'd3-time-format';
import { isValidCoordinate } from '../util/map';
import { styleByDataItem } from '../util/styleByDataItem';
import {
    getOrgUnitsFromRows,
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodFromFilters,
    getPeriodNameFromId,
    getApiResponseNames,
} from '../util/analytics';
import { EVENT_COLOR, EVENT_RADIUS } from '../constants/layers';

const formatTime = date => timeFormat('%Y-%m-%d')(new Date(date));

// Returns a promise
const eventLoader = async layerConfig => {
    const config = { ...layerConfig };
    const {
        columns,
        endDate,
        eventClustering,
        eventCoordinateField,
        eventPointColor,
        eventPointRadius,
        filters,
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

    config.name = programStage.name;

    config.legend = {
        title: config.name,
        period: period
            ? getPeriodNameFromId(period.id)
            : `${formatTime(startDate)} - ${formatTime(endDate)}`,
        items: [],
    };

    let names;

    if (spatialSupport && eventClustering) {
        const response = await d2.analytics.events.getCount(analyticsRequest);
        config.bounds = getBounds(response.extent);
        config.serverCluster =
            useServerCluster(response.count) && !styleDataItem;
    }

    if (!config.serverCluster) {
        const response = await d2.analytics.events.getQuery(analyticsRequest);

        names = getApiResponseNames(response);

        config.data = response.rows
            .map(row =>
                createEventFeature(
                    response.headers,
                    names,
                    row,
                    eventCoordinateField
                )
            )
            .filter(feature => isValidCoordinate(feature.geometry.coordinates));

        if (Array.isArray(config.data) && config.data.length) {
            if (styleDataItem) {
                await styleByDataItem(config);
            } else {
                config.legend.items = [
                    {
                        name: i18n.t('Event'),
                        color: eventPointColor || EVENT_COLOR,
                        radius: eventPointRadius || EVENT_RADIUS,
                    },
                ];
            }

            if (areaRadius) {
                config.legend.explanation = `${areaRadius} ${'m'} ${'buffer'}`;
            }
        }

        config.legend.filters =
            dataFilters &&
            getFiltersAsText(dataFilters, {
                ...names,
                ...(await getFilterOptionNames(dataFilters, response.headers)),
            });
    }

    config.isLoaded = true;
    config.isExpanded = true;
    config.isVisible = true;

    return config;
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
            if (item.dimension) {
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

// If the layer included filters using option sets, this function return an object
// mapping option codes to named used to translate codes in the legend
const getFilterOptionNames = async (filters, headers) => {
    const d2 = await getD2();

    if (!filters) {
        return null;
    }

    // Returns array of option set ids used for filtering
    const optionSets = filters
        .map(filter => headers.find(header => header.name === filter.dimension))
        .filter(header => header.optionSet)
        .map(header => header.optionSet);

    if (!optionSets.length) {
        return;
    }

    // Returns one object with all option codes mapped to names
    return Object.assign(
        ...(await Promise.all(
            optionSets.map(id =>
                d2.models.optionSets
                    .get(id, {
                        fields: 'options[code,displayName~rename(name)]',
                    })
                    .then(model => model.options)
                    .then(options =>
                        options.reduce((obj, { code, name }) => {
                            obj[code] = name;
                            return obj;
                        }, {})
                    )
            )
        ))
    );
};

export default eventLoader;
