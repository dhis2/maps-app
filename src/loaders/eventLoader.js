import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { isValidUid } from 'd2/uid';
import { numberValueTypes } from '../constants/valueTypes.js';
import { getEventColumns } from '../epics/dataDownload';
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
import { getEventStatuses } from '../constants/eventStatuses';
import {
    EVENT_CLIENT_PAGE_SIZE,
    EVENT_SERVER_CLUSTER_COUNT,
    EVENT_COLOR,
    EVENT_RADIUS,
} from '../constants/layers';
import { formatStartEndDate, getDateArray } from '../util/time';
import { cssColor, getContrastColor } from '../util/colors';

// Server clustering if more than 2000 events
const useServerCluster = count => count > EVENT_SERVER_CLUSTER_COUNT;

const accessDeniedAlert = {
    warning: true,
    message: i18n.t("You don't have access to this layer data"),
};
const unknownErrorAlert = {
    critical: true,
    message: i18n.t('An unknown error occurred while reading layer data'),
};

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
        columns,
        endDate,
        eventStatus,
        eventClustering,
        eventPointColor,
        eventPointRadius,
        filters,
        programStage,
        startDate,
        styleDataItem,
        areaRadius,
        showDataTable,
    } = config;

    const period = getPeriodFromFilters(filters);
    const dataFilters = getFiltersFromColumns(columns);
    const d2 = await getD2();
    const spatialSupport = d2.system.systemInfo.databaseInfo.spatialSupport;

    config.isExtended = showDataTable;

    let analyticsRequest = await getAnalyticsRequest(config);
    let alert;

    config.name = programStage.name;

    config.legend = {
        title: config.name,
        period: period
            ? getPeriodNameFromId(period.id)
            : formatStartEndDate(
                  getDateArray(startDate),
                  getDateArray(endDate)
              ),
        items: [],
    };

    // Delete serverCluster option if previously set
    delete config.serverCluster;

    // Check if events should be clustered on the server or the client
    // Style by data item is only supported in the client (donuts)
    if (spatialSupport && eventClustering && !styleDataItem) {
        const response = await getCount(analyticsRequest);
        config.bounds = getBounds(response.extent);
        config.serverCluster = useServerCluster(response.count);
    }

    if (!config.serverCluster) {
        config.outputIdScheme = 'ID'; // Required for StyleByDataItem to work
        const { names, data, response } = await loadData(
            analyticsRequest,
            config
        );
        const { total } = response.metaData.pager;

        config.data = data;

        if (Array.isArray(config.data) && config.data.length) {
            if (styleDataItem) {
                await styleByDataItem(config);
            }

            if (total > EVENT_CLIENT_PAGE_SIZE) {
                alert = {
                    warning: true,
                    message: `${config.name}: ${i18n.t(
                        'Displaying first {{pageSize}} events out of {{total}}',
                        {
                            pageSize: EVENT_CLIENT_PAGE_SIZE,
                            total,
                        }
                    )}`,
                };
            }
        } else {
            alert = {
                warning: true,
                message: `${config.name}: ${i18n.t('No data found')}`,
            };
        }

        // TODO: Add filters to legend when using server cluster
        // Currently not done as names are not available
        config.legend.filters =
            dataFilters &&
            getFiltersAsText(dataFilters, {
                ...names,
                ...(await getFilterOptionNames(dataFilters, response.headers)),
            });

        config.headers = response.headers;

        const numericDataItemHeaders = config.headers.filter(
            header =>
                isValidUid(header.name) &&
                numberValueTypes.includes(header.valueType)
        );

        if (numericDataItemHeaders.length) {
            config.data = config.data.map(d => {
                const newD = { ...d };

                numericDataItemHeaders.forEach(header => {
                    newD.properties[header.name] = parseFloat(
                        d.properties[header.name]
                    );
                });

                return newD;
            });
        }
    }

    if (!styleDataItem) {
        const color = cssColor(eventPointColor) || EVENT_COLOR;
        const strokeColor = getContrastColor(color);

        config.legend.items = [
            {
                name: i18n.t('Event'),
                color,
                strokeColor,
                radius: eventPointRadius || EVENT_RADIUS,
            },
        ];
    }

    let explanation = [];

    if (eventStatus) {
        explanation.push(
            `${i18n.t('Event status')}: ${
                getEventStatuses().find(s => s.id === eventStatus).name
            }`
        );
    }

    if (areaRadius) {
        explanation.push(`${i18n.t('Buffer')}: ${areaRadius} ${'m'}`);
    }

    if (explanation.length) {
        config.legend.explanation = explanation;
    }

    if (alert) {
        config.alerts = [alert];
    }
};

// Also used to query for server cluster in map/EventLayer.js
// TODO: Use DataIDScheme / OutputIDScheme instead of requesting all metaData (which can easily dwarf the actual response data)
export const getAnalyticsRequest = async ({
    program,
    programStage,
    filters,
    startDate,
    endDate,
    rows,
    columns,
    styleDataItem,
    eventStatus,
    eventCoordinateField,
    relativePeriodDate,
    isExtended,
}) => {
    const orgUnits = getOrgUnitsFromRows(rows);
    const period = getPeriodFromFilters(filters);
    const dataItems = addStyleDataItem(
        columns.filter(isValidDimension),
        styleDataItem
    );

    // Add "display in reports" columns that are not already present
    if (isExtended) {
        const displayColumns = await getEventColumns({ programStage });

        displayColumns.forEach(col => {
            if (!dataItems.find(item => item.dimension === col.dimension)) {
                dataItems.push(col);
            }
        });
    }

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
            analyticsRequest = analyticsRequest.addDimension(
                item.dimension,
                item.filter
            );
        });
    }

    if (eventCoordinateField) {
        // If coordinate field other than event coordinate
        analyticsRequest = analyticsRequest
            .addDimension(eventCoordinateField) // Used by analytics/events/query/
            .withCoordinateField(eventCoordinateField); // Used by analytics/events/count and analytics/events/cluster
    }

    if (eventStatus && eventStatus !== 'ALL') {
        analyticsRequest = analyticsRequest.withEventStatus(eventStatus);
    }

    return analyticsRequest;
};

export const getCount = async request => {
    const d2 = await getD2();
    return await d2.analytics.events.getCount(request);
};

export const loadData = async (request, config = {}) => {
    const d2 = await getD2();
    const response = await d2.analytics.events.getQuery(
        request.withPageSize(EVENT_CLIENT_PAGE_SIZE) // DHIS2-10742
    );

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

    const mappedOptionSets = await Promise.all(
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
    );

    // Returns one object with all option codes mapped to names
    return mappedOptionSets.reduce(
        (obj, set) => ({
            ...obj,
            ...set,
        }),
        {}
    );
};

// Empty filter sometimes returned for saved maps
// Dimension without filter and empty items array returns false
const isValidDimension = ({ dimension, filter, items }) =>
    Boolean(dimension && (filter || !items || items.length));

export default eventLoader;
