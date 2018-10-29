import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { timeFormat } from 'd3-time-format';
import { styleByDataItem } from '../util/styleByDataItem';
import {
    getOrgUnitsFromRows,
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodFromFilters,
    getPeriodNameFromId,
} from '../util/analytics';
import {
    createEventFeatures,
    addStyleDataItem,
    getBounds,
} from '../util/geojson';
import { EVENT_COLOR, EVENT_RADIUS } from '../constants/layers';
import findIndex from 'lodash/findIndex';

// Server clustering if more than 2000 events
const useServerCluster = count => count > 2000; // TODO: Use constant
const formatTime = date => timeFormat('%Y-%m-%d')(new Date(date));

// Returns a promise
const eventLoader = async layerConfig => {
    const config = { ...layerConfig };
    const {
        columns,
        endDate,
        eventClustering,
        eventPointColor,
        eventPointRadius,
        filters,
        programStage,
        startDate,
        styleDataItem,
        areaRadius,
    } = config;

    const period = getPeriodFromFilters(filters);
    const dataFilters = getFiltersFromColumns(columns);
    const d2 = await getD2();
    const spatialSupport = d2.system.systemInfo.databaseInfo.spatialSupport;

    let analyticsRequest = await getAnalyticsRequest(config);

    config.name = programStage.name;

    config.legend = {
        title: config.name,
        period: period
            ? getPeriodNameFromId(period.id)
            : `${formatTime(startDate)} - ${formatTime(endDate)}`,
        items: [],
    };

    if (spatialSupport && eventClustering) {
        const response = await getCount(analyticsRequest);
        config.bounds = getBounds(response.extent);
        config.serverCluster =
            useServerCluster(response.count) && !styleDataItem;
    }

    if (!config.serverCluster) {
        const { names, data, response } = await loadData(
            analyticsRequest,
            config
        );
        config.data = data;

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

// Also used to query for server cluster in map/EventLayer.js
export const getAnalyticsRequest = async ({
    program,
    programStage,
    filters,
    startDate,
    endDate,
    rows,
    columns,
    styleDataItem,
    eventCoordinateField,
    relativePeriodDate,
}) => {
    const orgUnits = getOrgUnitsFromRows(rows),
        period = getPeriodFromFilters(filters);
    let dataItems = addStyleDataItem(columns, styleDataItem);

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

export const getCount = async request => {
    const d2 = await getD2();
    return await d2.analytics.events.getCount(request);
};

export const loadData = async (request, config = {}) => {
    const d2 = await getD2();
    const response = await d2.analytics.events.getQuery(request);

    const { data, names } = createEventFeatures(response, config);

    return {
        data,
        names,
        response,
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
